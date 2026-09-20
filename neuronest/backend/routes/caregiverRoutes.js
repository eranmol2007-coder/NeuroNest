const express = require('express');
const router = express.Router();
const {
  createCaregiver,
  getCaregivers,
  getCaregiverById,
  findCaregiverByIdentifier,
  updateCaregiver,
  linkCaregiverToPatient,
  unlinkCaregiver,
  getCaregiverDashboard,
} = require('../controllers/caregiverController');

router.route('/').post(createCaregiver).get(getCaregivers);
router.route('/find/:identifier').get(findCaregiverByIdentifier);
router.route('/:id').get(getCaregiverById).put(updateCaregiver);
router.route('/:id/link').put(linkCaregiverToPatient);
router.route('/:id/unlink').put(unlinkCaregiver);
router.route('/:id/dashboard').get(getCaregiverDashboard);

module.exports = router;
