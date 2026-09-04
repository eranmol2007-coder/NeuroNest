const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reminiscenceController');

router.get('/themes', ctrl.getThemes);
router.post('/story', ctrl.generateStory);
router.get('/chapter/:themeKey/:chapterIndex', ctrl.getChapter);
router.post('/interaction', ctrl.recordInteraction);
router.get('/progress/:patientId', ctrl.getProgress);

module.exports = router;
