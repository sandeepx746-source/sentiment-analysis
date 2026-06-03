const express = require('express');
const { analyzeSingle, getHistory } = require('../controllers/sentimentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', protect, analyzeSingle);
router.get('/history', protect, getHistory);

module.exports = router;
