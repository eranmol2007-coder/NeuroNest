const mongoose = require('mongoose');

const gameHistoryEntrySchema = new mongoose.Schema(
  {
    gameType: {
      type: String,
      enum: ['memoryMatch', 'patternRecognition', 'dailyRoutineRecall'],
      required: true,
    },
    accuracy: { type: Number, min: 0, max: 100, required: true },
    timeTaken: { type: Number, required: true }, // seconds
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 1,
      max: 130,
    },
    language: {
      type: String,
      enum: ['English', 'Assamese', 'Bengali', 'Hindi', 'Khasi', 'Mizo', 'Nagamese', 'Manipuri', 'Nepali'],
      default: 'English',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    photoUrl: { type: String, default: '' },
    gameHistory: [gameHistoryEntrySchema],
    currentDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caregiver',
    },
    fontSizePreference: {
      type: String,
      enum: ['normal', 'large', 'extra-large'],
      default: 'large',
    },
    voiceVolume: { type: Number, min: 0, max: 100, default: 70 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

patientSchema.index({ caregiverId: 1 });

module.exports = mongoose.model('Patient', patientSchema);
