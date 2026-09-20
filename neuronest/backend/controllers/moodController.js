const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');
const { checkMoodDeclineAlert } = require('../services/alertService');
const { analyzeSentiment } = require('../services/sentimentService');

const submitMood = asyncHandler(async (req, res) => {
  const { MoodCheckin, Alert } = getModels();
  const { patientId, mood, note } = req.body;
  if (!patientId || !mood) {
    res.status(400);
    throw new Error('patientId and mood are required');
  }

  // AI sentiment analysis on the note (if provided)
  let sentimentData = null;
  if (note && note.trim().length > 0) {
    sentimentData = await analyzeSentiment(note);
  }

  const moodScore = MoodCheckin.scoreForMood(mood);
  const checkin = await MoodCheckin.create({
    patientId, mood, moodScore, note, date: new Date(),
    sentiment: sentimentData ? {
      label: sentimentData.sentiment,
      score: sentimentData.score,
      severity: sentimentData.severity,
    } : undefined,
  });

  const recent = await MoodCheckin.find({ patientId }).sort({ createdAt: -1 }).limit(5);
  const alertPayload = checkMoodDeclineAlert(patientId, recent);
  let alertCreated = null;

  // Also create alert if sentiment analysis detects critical severity
  if (sentimentData && sentimentData.severity === 'critical') {
    const sentimentAlert = {
      patientId,
      type: 'mood_decline',
      severity: 'critical',
      message: `AI sentiment analysis detected critical distress in patient's mood note: "${note.substring(0, 100)}..."`,
    };
    alertCreated = await Alert.create(sentimentAlert);
  } else if (alertPayload) {
    alertCreated = await Alert.create(alertPayload);
  }

  res.status(201).json({
    success: true,
    data: {
      checkin,
      alertRaised: alertCreated,
      sentiment: sentimentData,
    },
  });
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
