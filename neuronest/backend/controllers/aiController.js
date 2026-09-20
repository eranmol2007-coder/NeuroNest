const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');
const { translate, translateChapters, translateQuizItem, getSupportedLanguages } = require('../services/translationService');
const { generateReport } = require('../services/reportService');

/**
 * POST /api/ai/translate
 * Translate text between languages
 */
const translateText = asyncHandler(async (req, res) => {
  const { text, fromLang, toLang } = req.body;

  if (!text || !fromLang || !toLang) {
    res.status(400);
    throw new Error('text, fromLang, and toLang are required');
  }

  const result = await translate(text, fromLang, toLang);
  res.json({ success: true, data: result });
});

/**
 * POST /api/ai/translate-story
 * Translate all chapters of a story to a target language
 */
const translateStory = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const { storyId, toLang } = req.body;

  if (!storyId || !toLang) {
    res.status(400);
    throw new Error('storyId and toLang are required');
  }

  const story = await PersonalStory.findById(storyId);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }

  const fromLang = story.language || 'English';
  const translatedChapters = await translateChapters(story.chapters || [], fromLang, toLang);

  let translatedQuestions = story.questions || [];
  if (translatedQuestions.length > 0) {
    translatedQuestions = await Promise.all(
      translatedQuestions.map(q => translateQuizItem(q, fromLang, toLang))
    );
  }

  res.json({
    success: true,
    data: {
      originalLanguage: fromLang,
      targetLanguage: toLang,
      title: story.title,
      chapters: translatedChapters,
      questions: translatedQuestions,
    },
  });
});

/**
 * POST /api/ai/report
 * Generate a cognitive decline report for a patient
 */
const generatePatientReport = asyncHandler(async (req, res) => {
  const { GameScore, MoodCheckin, Reminder, Patient } = getModels();
  const { patientId, period = 'week' } = req.body;

  if (!patientId) {
    res.status(400);
    throw new Error('patientId is required');
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Calculate date range
  const now = new Date();
  const daysBack = period === 'month' ? 30 : 7;
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  const [recentScores, recentMoods, reminders] = await Promise.all([
    GameScore.find({ patientId, date: { $gte: startDate } }).sort({ date: -1 }),
    MoodCheckin.find({ patientId, date: { $gte: startDate } }).sort({ date: -1 }),
    Reminder.find({ patientId }),
  ]);

  const report = await generateReport({
    recentScores,
    recentMoods,
    reminders,
    patient: { name: patient.name, age: patient.age },
    period,
  });

  res.json({ success: true, data: report });
});

/**
 * GET /api/ai/languages
 * Get list of supported languages
 */
const getLanguages = asyncHandler(async (req, res) => {
  res.json({ success: true, data: getSupportedLanguages() });
});

module.exports = {
  translateText,
  translateStory,
  generatePatientReport,
  getLanguages,
};
