const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
}, { _id: false });

const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const personalStorySchema = new mongoose.Schema(
  {
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '📖',
    },
    color: {
      type: String,
      default: '#7a9a7a',
    },
    chapters: [chapterSchema],
    questions: [questionSchema],
    language: {
      type: String,
      default: 'English',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

personalStorySchema.index({ patientId: 1, isPublished: 1 });
personalStorySchema.index({ caregiverId: 1 });

module.exports = mongoose.model('PersonalStory', personalStorySchema);
