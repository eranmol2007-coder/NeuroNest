const express = require('express');
const router = express.Router();
const { createAlert, getAlertsForPatient, resolveAlert } = require('../controllers/alertController');

router.route('/').post(createAlert);
router.route('/patient/:patientId').get(getAlertsForPatient);
router.route('/:id/resolve').patch(resolveAlert);

module.exports = router;
