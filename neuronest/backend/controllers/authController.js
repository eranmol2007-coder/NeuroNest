const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { getModels } = require('../utils/modelResolver');

const JWT_SECRET = process.env.JWT_SECRET || 'neuronest_jwt_secret_2024';
const OTP_EXPIRY_MINUTES = 10;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const sendOtpToConsole = (identifier, code, purpose) => {
  console.log(`\n  ┌─────────────────────────────────────────┐`);
  console.log(`  │  OTP for ${purpose.toUpperCase()}`);
  console.log(`  │  Sent to: ${identifier}`);
  console.log(`  │  Code: ${code}`);
  console.log(`  │  Expires in ${OTP_EXPIRY_MINUTES} minutes`);
  console.log(`  └─────────────────────────────────────────┘\n`);
};

const sendOtp = asyncHandler(async (req, res) => {
  const { User, Otp } = getModels();
  const { identifier, purpose } = req.body;

  if (!identifier || !purpose) {
    res.status(400);
    throw new Error('Identifier (email or phone) and purpose are required');
  }

  if (!['signup', 'signin', 'caregiver'].includes(purpose)) {
    res.status(400);
    throw new Error('Purpose must be "signup", "signin", or "caregiver"');
  }

  const normalizedId = identifier.trim().toLowerCase();
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.deleteMany({ identifier: normalizedId, purpose, used: false });
  await Otp.create({ identifier: normalizedId, code, purpose, expiresAt });

  sendOtpToConsole(normalizedId, code, purpose);

  res.json({
    success: true,
    message: `OTP sent to ${normalizedId}`,
    _dev_code: code,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { User, Otp, Patient, Caregiver } = getModels();
  const { identifier, code, purpose, name, age, language, gender } = req.body;

  if (!identifier || !code || !purpose) {
    res.status(400);
    throw new Error('Identifier, code, and purpose are required');
  }

  const normalizedId = identifier.trim().toLowerCase();

  const otpRecord = await Otp.findOne({
    identifier: normalizedId,
    purpose,
    used: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    res.status(400);
    throw new Error('No OTP found. Please request a new one.');
  }

  if (new Date() > otpRecord.expiresAt) {
    res.status(400);
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (otpRecord.code !== code) {
    res.status(400);
    throw new Error('Invalid OTP code');
  }

  otpRecord.used = true;
  await otpRecord.save();

  if (purpose === 'caregiver') {
    const { name: caregiverName } = req.body;
    const caregiver = await Caregiver.findOne({
      $or: [{ email: normalizedId }, { phone: normalizedId }],
    });
    if (!caregiver) {
      res.status(404);
      throw new Error('No caregiver account found with this email/phone. Please ask the patient to add you as a caregiver first.');
    }

    let user = await User.findOne({
      $or: [{ email: normalizedId }, { phone: normalizedId }],
    });

    if (!user) {
      user = await User.create({
        email: normalizedId.includes('@') ? normalizedId : undefined,
        phone: !normalizedId.includes('@') ? normalizedId : undefined,
        password: code,
        name: caregiverName || caregiver.name,
        role: 'caregiver',
        patientId: caregiver.linkedPatientId,
        caregiverId: caregiver._id,
        isVerified: true,
      });
    } else {
      if (caregiverName) user.name = caregiverName;
      user.role = 'caregiver';
      user.caregiverId = caregiver._id;
      if (caregiver.linkedPatientId && !user.patientId) {
        user.patientId = caregiver.linkedPatientId;
      }
      await user.save();
    }

    const token = generateToken(user._id);
    let patient = null;
    if (caregiver.linkedPatientId) {
      patient = await Patient.findById(caregiver.linkedPatientId);
    }

    res.json({
      success: true,
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, patientId: user.patientId, caregiverId: caregiver._id },
        patient,
        caregiver,
      },
    });
    return;
  }

  if (purpose === 'signup') {
    if (!name) {
      res.status(400);
      throw new Error('Name is required for signup');
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedId }, { phone: normalizedId }],
    });

    if (existingUser) {
      res.status(400);
      throw new Error('Account already exists with this identifier. Please sign in.');
    }

    const patient = await Patient.create({
      name,
      age: age || 65,
      language: language || 'English',
      gender: gender || 'Prefer not to say',
    });

    const user = await User.create({
      email: normalizedId.includes('@') ? normalizedId : undefined,
      phone: !normalizedId.includes('@') ? normalizedId : undefined,
      password: code,
      name,
      role: 'patient',
      patientId: patient._id,
      isVerified: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, patientId: user.patientId },
        patient,
      },
    });
  } else {
    const user = await User.findOne({
      $or: [{ email: normalizedId }, { phone: normalizedId }],
    });

    if (!user) {
      res.status(404);
      throw new Error('No account found. Please sign up first.');
    }

    const token = generateToken(user._id);

    let patient = null;
    if (user.patientId) {
      patient = await Patient.findById(user.patientId);
    }

    res.json({
      success: true,
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, patientId: user.patientId },
        patient,
      },
    });
  }
});

const getMe = asyncHandler(async (req, res) => {
  const { User, Patient, Caregiver } = getModels();
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let patient = null;
  if (user.patientId) {
    patient = await Patient.findById(user.patientId);
  }

  let caregiver = null;
  if (user.caregiverId) {
    caregiver = await Caregiver.findById(user.caregiverId);
  } else if (user.patientId) {
    caregiver = await Caregiver.findOne({ linkedPatientId: user.patientId });
  }

  res.json({
    success: true,
    data: { user, patient, caregiver },
  });
});

module.exports = { sendOtp, verifyOtp, getMe, JWT_SECRET };
