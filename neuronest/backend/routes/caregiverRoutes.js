const express = require('express');
const router = express.Router();
const {
  createCaregiver,
  getCaregivers,
  getCaregiverById,
  updateCaregiver,
  getCaregiverDashboard,
} = require('../controllers/caregiverController');

router.route('/').post(createCaregiver).get(getCaregivers);
router.route('/:id').get(getCaregiverById).put(updateCaregiver);
router.route('/:id/dashboard').get(getCaregiverDashboard);

module.exports = router;
