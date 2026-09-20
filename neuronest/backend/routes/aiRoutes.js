const express = require('express');
const router = express.Router();
const {
  translateText,
  translateStory,
  generatePatientReport,
  getLanguages,
} = require('../controllers/aiController');

router.get('/languages', getLanguages);
router.post('/translate', translateText);
router.post('/translate-story', translateStory);
router.post('/report', generatePatientReport);

module.exports = router;
