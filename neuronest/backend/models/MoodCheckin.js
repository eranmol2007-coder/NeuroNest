const mongoose = require('mongoose');

// Supports the "mood check-in" home dashboard feature and the
// caregiver dashboard's "mood trends" graph.
const moodCheckinSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'low', 'bad'],
      required: true,
    },
    moodScore: {
      // numeric mapping so charts can plot a trend line: great=5 ... bad=1
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

moodCheckinSchema.index({ patientId: 1, date: -1 });

const moodScoreMap = { great: 5, good: 4, okay: 3, low: 2, bad: 1 };

moodCheckinSchema.statics.scoreForMood = function (mood) {
  return moodScoreMap[mood] ?? 3;
};

module.exports = mongoose.model('MoodCheckin', moodCheckinSchema);
