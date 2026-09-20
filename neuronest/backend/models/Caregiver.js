const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Caregiver name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    relationToPatient: {
      type: String,
      default: 'Family Member',
    },
    linkedPatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    alerts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert',
      },
    ],
    notificationPreferences: {
      lowAccuracy: { type: Boolean, default: true },
      missedReminder: { type: Boolean, default: true },
      moodDecline: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

caregiverSchema.index({ linkedPatientId: 1 });

module.exports = mongoose.model('Caregiver', caregiverSchema);
