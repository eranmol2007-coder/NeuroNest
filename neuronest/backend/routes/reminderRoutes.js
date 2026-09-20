const express = require('express');
const router = express.Router();
const {
  createReminder,
  getRemindersForPatient,
  updateReminderStatus,
  updateReminder,
  deleteReminder,
  checkMissedReminders,
} = require('../controllers/reminderController');

router.route('/').post(createReminder);
router.route('/check-missed').post(checkMissedReminders);
router.route('/patient/:patientId').get(getRemindersForPatient);
router.route('/:id/status').patch(updateReminderStatus);
router.route('/:id').put(updateReminder).delete(deleteReminder);

module.exports = router;
