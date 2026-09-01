const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');

const createCaregiver = asyncHandler(async (req, res) => {
  const { Caregiver, Patient } = getModels();
  const { name, email, phone, relationToPatient, linkedPatientId } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Caregiver name is required');
  }

  const caregiver = await Caregiver.create({
    name, email, phone, relationToPatient,
    linkedPatientId: linkedPatientId || undefined,
  });

  if (linkedPatientId) {
    await Patient.findByIdAndUpdate(linkedPatientId, { caregiverId: caregiver._id });
  }

  res.status(201).json({ success: true, data: caregiver });
});

const getCaregivers = asyncHandler(async (req, res) => {
  const { Caregiver } = getModels();
  const caregivers = await Caregiver.find().populate('linkedPatientId', 'name age language');
  res.json({ success: true, count: caregivers.length, data: caregivers });
});

const getCaregiverById = asyncHandler(async (req, res) => {
  const { Caregiver } = getModels();
  const caregiver = await Caregiver.findById(req.params.id).populate('linkedPatientId');
  if (!caregiver) {
    res.status(404);
    throw new Error('Caregiver not found');
  }
  res.json({ success: true, data: caregiver });
});

const updateCaregiver = asyncHandler(async (req, res) => {
  const { Caregiver } = getModels();
  const caregiver = await Caregiver.findById(req.params.id);
  if (!caregiver) {
    res.status(404);
    throw new Error('Caregiver not found');
  }
  const allowed = ['name', 'email', 'phone', 'relationToPatient', 'notificationPreferences'];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) caregiver[f] = req.body[f];
  });
  const updated = await caregiver.save();
  res.json({ success: true, data: updated });
});

const getCaregiverDashboard = asyncHandler(async (req, res) => {
  const { Caregiver, Patient, GameScore, Alert, MoodCheckin } = getModels();
  const caregiver = await Caregiver.findById(req.params.id);
  if (!caregiver) {
    res.status(404);
    throw new Error('Caregiver not found');
  }
  if (!caregiver.linkedPatientId) {
    return res.json({
      success: true,
      data: { caregiver, patient: null, scores: [], alerts: [], moodTrend: [] },
    });
  }

  const patientId = caregiver.linkedPatientId;
  const [patient, scores, alerts, moods] = await Promise.all([
    Patient.findById(patientId),
    GameScore.find({ patientId }).sort({ date: -1 }).limit(30),
    Alert.find({ patientId }).sort({ timestamp: -1 }).limit(20),
    MoodCheckin.find({ patientId }).sort({ date: -1 }).limit(14),
  ]);

  const byGameType = {};
  scores.forEach((s) => {
    if (!byGameType[s.gameType]) byGameType[s.gameType] = [];
    byGameType[s.gameType].push(s.accuracy);
  });
  const performanceSummary = Object.entries(byGameType).map(([gameType, arr]) => ({
    gameType,
    averageAccuracy: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    gamesPlayed: arr.length,
  }));

  res.json({
    success: true,
    data: {
      caregiver, patient,
      scores: scores.reverse(),
      performanceSummary, alerts,
      moodTrend: moods.reverse().map((m) => ({
        date: m.date, mood: m.mood, moodScore: m.moodScore,
      })),
    },
  });
});

module.exports = {
  createCaregiver, getCaregivers, getCaregiverById,
  updateCaregiver, getCaregiverDashboard,
};
