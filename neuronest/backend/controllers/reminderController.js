const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');
const { checkMissedReminderAlert } = require('../services/alertService');

const createReminder = asyncHandler(async (req, res) => {
  const { Reminder } = getModels();
  const { patientId, type, title, notes, time, isRecurring } = req.body;

  if (!patientId || !type || !title || !time) {
    res.status(400);
    throw new Error('patientId, type, title, and time are required');
  }

  const reminder = await Reminder.create({
    patientId, type, title, notes, time,
    isRecurring: isRecurring !== undefined ? isRecurring : true,
  });

  res.status(201).json({ success: true, data: reminder });
});

const getRemindersForPatient = asyncHandler(async (req, res) => {
  const { Reminder } = getModels();
  const { status } = req.query;
  const query = { patientId: req.params.patientId };
  if (status) query.status = status;

  const reminders = await Reminder.find(query).sort({ time: 1 });
  res.json({ success: true, count: reminders.length, data: reminders });
});

const updateReminderStatus = asyncHandler(async (req, res) => {
  const { Reminder } = getModels();
  const { status, triggeredNow } = req.body;
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  if (triggeredNow) {
    reminder.lastTriggeredAt = new Date();
  }

  if (status) {
    reminder.status = status;
    if (status === 'completed') reminder.lastCompletedAt = new Date();
  }

  await reminder.save();
  res.json({ success: true, data: reminder });
});

const updateReminder = asyncHandler(async (req, res) => {
  const { Reminder } = getModels();
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  const allowed = ['type', 'title', 'notes', 'time', 'isRecurring'];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) reminder[f] = req.body[f];
  });
  const updated = await reminder.save();
  res.json({ success: true, data: updated });
});

const deleteReminder = asyncHandler(async (req, res) => {
  const { Reminder } = getModels();
  const reminder = await Reminder.findById(req.params.id);
  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }
  await reminder.deleteOne();
  res.json({ success: true, message: 'Reminder deleted' });
});

const checkMissedReminders = asyncHandler(async (req, res) => {
  const { Reminder, Alert } = getModels();
  const { patientId, gracePeriodMinutes } = req.body;
  const query = { status: 'pending' };
  if (patientId) query.patientId = patientId;

  const pending = await Reminder.find(query);
  const alertsCreated = [];

  for (const reminder of pending) {
    const payload = checkMissedReminderAlert(reminder, gracePeriodMinutes || 30);
    if (payload) {
      reminder.status = 'missed';
      await reminder.save();
      const alert = await Alert.create(payload);
      alertsCreated.push(alert);
    }
  }

  res.json({ success: true, checked: pending.length, alertsCreated });
});

module.exports = {
  createReminder, getRemindersForPatient, updateReminderStatus,
  updateReminder, deleteReminder, checkMissedReminders,
};
