const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'low_accuracy',       // sudden drop in game accuracy
        'missed_reminder',    // medicine/water/appointment missed
        'mood_decline',       // mood check-ins trending negative
        'inactivity',         // patient hasn't opened the app / played in X days
        'high_difficulty_struggle', // repeated failures at current difficulty
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

alertSchema.index({ patientId: 1, resolved: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', alertSchema);
