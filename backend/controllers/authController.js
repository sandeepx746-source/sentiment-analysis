const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        return res.status(500).json({ message: 'Server error' });
      }
      
      const userId = this.lastID;
      res.status(201).json({
        id: userId,
        username,
        token: generateToken(userId, username)
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, row.password);
    if (isMatch) {
      res.json({
        id: row.id,
        username: row.username,
        token: generateToken(row.id, row.username)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
};

const getUserProfile = (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
};

module.exports = { registerUser, loginUser, getUserProfile };
