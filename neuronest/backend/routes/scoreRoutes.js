const express = require('express');
const router = express.Router();
const {
  submitScore,
  getScoresForPatient,
  getPatientScoreSummary,
} = require('../controllers/gameScoreController');

router.route('/').post(submitScore);
router.route('/patient/:patientId').get(getScoresForPatient);
router.route('/patient/:patientId/summary').get(getPatientScoreSummary);

module.exports = router;
