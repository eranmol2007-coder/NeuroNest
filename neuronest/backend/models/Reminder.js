const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    type: {
      type: String,
      enum: ['medicine', 'water', 'appointment', 'meal', 'exercise'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    time: {
      // HH:mm 24hr string for recurring daily reminders, OR a full ISO date for one-off appointments
      type: String,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'missed', 'snoozed'],
      default: 'pending',
    },
    lastTriggeredAt: {
      type: Date,
    },
    lastCompletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reminderSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
