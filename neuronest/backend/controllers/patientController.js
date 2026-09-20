const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');

const createPatient = asyncHandler(async (req, res) => {
  const { Patient, Caregiver } = getModels();
  const { name, age, language, gender, fontSizePreference, voiceVolume, caregiverId } = req.body;

  if (!name || !age) {
    res.status(400);
    throw new Error('Name and age are required to create a patient profile');
  }

  const patient = await Patient.create({
    name,
    age,
    language,
    gender,
    fontSizePreference,
    voiceVolume,
    caregiverId: caregiverId || undefined,
  });

  if (caregiverId) {
    await Caregiver.findByIdAndUpdate(caregiverId, { linkedPatientId: patient._id });
  }

  res.status(201).json({ success: true, data: patient });
});

const getPatients = asyncHandler(async (req, res) => {
  const { Patient } = getModels();
  const patients = await Patient.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ success: true, count: patients.length, data: patients });
});

const getPatientById = asyncHandler(async (req, res) => {
  const { Patient } = getModels();
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, data: patient });
});

const updatePatient = asyncHandler(async (req, res) => {
  const { Patient } = getModels();
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const allowedFields = [
    'name', 'age', 'language', 'gender', 'photoUrl',
    'currentDifficulty', 'fontSizePreference', 'voiceVolume',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) patient[field] = req.body[field];
  });

  const updated = await patient.save();
  res.json({ success: true, data: updated });
});

const deletePatient = asyncHandler(async (req, res) => {
  const { Patient } = getModels();
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  patient.isActive = false;
  await patient.save();
  res.json({ success: true, message: 'Patient deactivated', data: { id: patient._id } });
});

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
