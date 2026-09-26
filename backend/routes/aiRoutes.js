const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze', aiController.analyzeLegalProblem);
router.post('/translate', aiController.translateLegalese);
router.post('/tts', aiController.generateSpeech);
router.post('/synthesize-brief', aiController.synthesizeCaseBrief);

module.exports = router;
