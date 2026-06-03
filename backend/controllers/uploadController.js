const multer = require('multer');
const fs = require('fs');
const Papa = require('papaparse');
const db = require('../database/db');
const { analyzeText } = require('./sentimentController');

const upload = multer({ dest: 'uploads/' });

const uploadCSV = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const filePath = req.file.path;
  const fileContent = fs.readFileSync(filePath, 'utf8');

  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data;
      let processed = 0;
      let errorCount = 0;

      data.forEach(row => {
        const text = row.Comment || row.content || row.text;
        if (!text) {
          errorCount++;
          return;
        }

        const platform = row.Platform || 'CSV';
        const username = row.Username || 'Anonymous';
        const likes = row.Likes ? parseInt(row.Likes, 10) : 0;

        const { sentiment, fakeScore } = analyzeText(text);

        db.run(
          'INSERT INTO posts (user_id, platform, username, content, sentiment, fake_score, likes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [req.user.id, platform, username, text, sentiment, fakeScore, likes],
          (err) => {
            if (err) console.error(err);
          }
        );
        processed++;
      });

      fs.unlinkSync(filePath); // delete temp file

      res.json({ message: 'CSV processed successfully', processed, errors: errorCount });
    },
    error: (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ message: 'Error parsing CSV', error: err.message });
    }
  });
};

module.exports = { upload, uploadCSV };
