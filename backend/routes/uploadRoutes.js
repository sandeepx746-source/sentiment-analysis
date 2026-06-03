const express = require('express');
const { upload, uploadCSV } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/csv', protect, upload.single('file'), uploadCSV);

module.exports = router;
