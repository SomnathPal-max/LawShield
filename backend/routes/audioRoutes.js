const multer = require('multer');
const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const { protect } = require('../middleware/auth');

// Configure multer for audio uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/transcribe', protect, upload.single('audio'), audioController.transcribeAudio);

module.exports = router;
