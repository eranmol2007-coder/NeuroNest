const express = require('express');
const router = express.Router();
const { submitMood, getMoodsForPatient } = require('../controllers/moodController');

router.route('/').post(submitMood);
router.route('/patient/:patientId').get(getMoodsForPatient);

module.exports = router;
