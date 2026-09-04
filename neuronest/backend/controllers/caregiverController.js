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

const findCaregiverByIdentifier = asyncHandler(async (req, res) => {
  const { Caregiver } = getModels();
  const { identifier } = req.params;
  if (!identifier) {
    res.status(400);
    throw new Error('Identifier is required');
  }
  const normalized = identifier.trim().toLowerCase();
  const caregiver = await Caregiver.findOne({
    $or: [{ email: normalized }, { phone: normalized }],
  });
  if (!caregiver) {
    return res.json({ success: false, data: null, message: 'No caregiver found with this email or phone' });
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

const linkCaregiverToPatient = asyncHandler(async (req, res) => {
  const { Caregiver, Patient } = getModels();
  const { id } = req.params;
  const { patientId } = req.body;
  const caregiver = await Caregiver.findById(id);
  if (!caregiver) {
    res.status(404);
    throw new Error('Caregiver not found');
  }
  caregiver.linkedPatientId = patientId;
  await caregiver.save();
  if (patientId) {
    await Patient.findByIdAndUpdate(patientId, { caregiverId: caregiver._id });
  }
  res.json({ success: true, data: caregiver });
});

const getCaregiverDashboard = asyncHandler(async (req, res) => {
  const { Caregiver, Patient, GameScore, Alert, MoodCheckin, User } = getModels();
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

  let patientWithContact = patient ? patient.toObject() : null;
  if (patient) {
    const user = await User.findOne({ patientId: patient._id });
    if (user) {
      patientWithContact.phone = user.phone || null;
      patientWithContact.email = user.email || null;
    }
  }

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
      caregiver, patient: patientWithContact,
      scores: scores.reverse(),
      performanceSummary, alerts,
      moodTrend: moods.reverse().map((m) => ({
        date: m.date || m.createdAt, mood: m.mood, moodScore: m.moodScore,
      })),
    },
  });
});

module.exports = {
  createCaregiver, getCaregivers, getCaregiverById,
  findCaregiverByIdentifier, updateCaregiver,
  linkCaregiverToPatient, getCaregiverDashboard,
};
