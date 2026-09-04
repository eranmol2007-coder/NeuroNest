const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');
const { checkMoodDeclineAlert } = require('../services/alertService');

const submitMood = asyncHandler(async (req, res) => {
  const { MoodCheckin, Alert } = getModels();
  const { patientId, mood, note } = req.body;
  if (!patientId || !mood) {
    res.status(400);
    throw new Error('patientId and mood are required');
  }

  const moodScore = MoodCheckin.scoreForMood(mood);
  const checkin = await MoodCheckin.create({ patientId, mood, moodScore, note, date: new Date() });

  const recent = await MoodCheckin.find({ patientId }).sort({ createdAt: -1 }).limit(5);
  const alertPayload = checkMoodDeclineAlert(patientId, recent);
  let alertCreated = null;
  if (alertPayload) {
    alertCreated = await Alert.create(alertPayload);
  }

  res.status(201).json({ success: true, data: { checkin, alertRaised: alertCreated } });
});

const getMoodsForPatient = asyncHandler(async (req, res) => {
  const { MoodCheckin } = getModels();
  const { limit } = req.query;
  const moods = await MoodCheckin.find({ patientId: req.params.patientId })
    .sort({ createdAt: -1 })
    .limit(limit ? parseInt(limit, 10) : 30);
  res.json({ success: true, count: moods.length, data: moods.reverse() });
});

module.exports = { submitMood, getMoodsForPatient };
