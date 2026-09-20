const express = require('express');
const router = express.Router();
const {
  createStory,
  getStoriesForPatient,
  getStoriesByCaregiver,
  getStoryById,
  updateStory,
  deleteStory,
  submitQuiz,
  getQuizResults,
  getStoryStats,
  generateQuizFromStory,
} = require('../controllers/personalStoryController');

router.post('/', createStory);
router.get('/patient/:patientId', getStoriesForPatient);
router.get('/caregiver/:caregiverId', getStoriesByCaregiver);
router.get('/stats/:caregiverId', getStoryStats);
router.get('/quiz/generate/:id', generateQuizFromStory);
router.get('/:id', getStoryById);
router.put('/:id', updateStory);
router.delete('/:id', deleteStory);
router.post('/quiz', submitQuiz);
router.get('/quiz/results/:patientId', getQuizResults);

module.exports = router;
