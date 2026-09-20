const express = require('express');
const router = express.Router();
const { processVoiceCommand } = require('../controllers/voiceController');

router.route('/command').post(processVoiceCommand);

module.exports = router;
