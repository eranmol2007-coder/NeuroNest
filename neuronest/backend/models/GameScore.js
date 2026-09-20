const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    gameType: {
      type: String,
      enum: ['memoryMatch', 'patternRecognition', 'dailyRoutineRecall'],
      required: true,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    timeTaken: {
      type: Number, // seconds
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    nextDifficulty: {
      // recorded so the frontend / caregiver dashboard can show the AI's decision
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

gameScoreSchema.index({ patientId: 1, date: -1 });
gameScoreSchema.index({ patientId: 1, gameType: 1 });

module.exports = mongoose.model('GameScore', gameScoreSchema);
