const db = require('../database/db');

// Basic NLP Keyword logic for demonstration
const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'amazing', 'best', 'fantastic'];
const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'trash', 'fake', 'scam'];

const spamWords = ['buy now', 'click here', 'subscribe', 'free', 'discount', 'giveaway', '100%'];

const analyzeText = (text) => {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 1;
  });

  let sentiment = 'Neutral';
  if (score > 0) sentiment = 'Positive';
  if (score < 0) sentiment = 'Negative';

  // Fake / Spam score calculation
  let fakeScore = 0;
  spamWords.forEach(word => {
    if (lowerText.includes(word)) fakeScore += 20;
  });

  if (lowerText.length < 5) fakeScore += 30; // too short
  if (lowerText === lowerText.toUpperCase() && lowerText.length > 10) fakeScore += 40; // all caps

  fakeScore = Math.min(fakeScore, 100);

  return { sentiment, fakeScore };
};

const analyzeSingle = (req, res) => {
  const { text, platform, username } = req.body;
  
  if (!text) return res.status(400).json({ message: 'Text is required' });

  const { sentiment, fakeScore } = analyzeText(text);

  if (req.user) {
    db.run(
      'INSERT INTO posts (user_id, platform, username, content, sentiment, fake_score) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, platform || 'Unknown', username || 'Anonymous', text, sentiment, fakeScore],
      function(err) {
        if (err) console.error('Error saving post', err);
      }
    );
  }

  res.json({ text, sentiment, fakeScore, confidence: Math.floor(Math.random() * 20) + 80 }); // dummy confidence
};

const getHistory = (req, res) => {
  db.all('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
};

module.exports = { analyzeSingle, analyzeText, getHistory };
