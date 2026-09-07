const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');

const createStory = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const { caregiverId, patientId, title, description, icon, color, chapters, questions, language } = req.body;

  if (!caregiverId || !patientId || !title) {
    res.status(400);
    throw new Error('caregiverId, patientId, and title are required');
  }

  if (!chapters || chapters.length === 0) {
    res.status(400);
    throw new Error('At least one chapter is required');
  }

  const story = await PersonalStory.create({
    caregiverId, patientId, title, description, icon, color,
    chapters, questions: questions || [],
    language: language || 'English',
  });

  res.status(201).json({ success: true, data: story });
});

const getStoriesForPatient = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const stories = await PersonalStory.find({
    patientId: req.params.patientId,
    isPublished: true,
  }).sort({ createdAt: -1 });

  res.json({ success: true, count: stories.length, data: stories });
});

const getStoriesByCaregiver = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const stories = await PersonalStory.find({
    caregiverId: req.params.caregiverId,
  }).sort({ createdAt: -1 });

  res.json({ success: true, count: stories.length, data: stories });
});

const getStoryById = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const story = await PersonalStory.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }
  res.json({ success: true, data: story });
});

const updateStory = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const story = await PersonalStory.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }

  const allowed = ['title', 'description', 'icon', 'color', 'chapters', 'questions', 'language', 'isPublished'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      story[field] = req.body[field];
    }
  });

  await story.save();
  res.json({ success: true, data: story });
});

const deleteStory = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const story = await PersonalStory.findByIdAndDelete(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }
  res.json({ success: true, message: 'Story deleted' });
});

const submitQuiz = asyncHandler(async (req, res) => {
  const { StoryQuiz, PersonalStory } = getModels();
  const { storyId, patientId, answers } = req.body;

  if (!storyId || !patientId || !answers) {
    res.status(400);
    throw new Error('storyId, patientId, and answers are required');
  }

  const story = await PersonalStory.findById(storyId);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }

  let score = 0;
  const totalQuestions = story.questions.length;
  const processedAnswers = answers.map((ans, idx) => {
    const isCorrect = ans.selectedAnswer === story.questions[idx]?.correctAnswer;
    if (isCorrect) score++;
    return { questionIndex: idx, selectedAnswer: ans.selectedAnswer, isCorrect };
  });

  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const quiz = await StoryQuiz.create({
    patientId, storyId,
    answers: processedAnswers,
    score, totalQuestions, accuracy,
    completedAt: new Date(),
  });

  res.status(201).json({ success: true, data: quiz });
});

const getQuizResults = asyncHandler(async (req, res) => {
  const { StoryQuiz } = getModels();
  const results = await StoryQuiz.find({ patientId: req.params.patientId })
    .populate('storyId', 'title icon')
    .sort({ completedAt: -1 });

  res.json({ success: true, count: results.length, data: results });
});

const getStoryStats = asyncHandler(async (req, res) => {
  const { StoryQuiz, PersonalStory } = getModels();
  const { caregiverId } = req.params;

  const stories = await PersonalStory.find({ caregiverId });
  const storyIds = stories.map(s => s._id);

  const quizzes = await StoryQuiz.find({ storyId: { $in: storyIds } });

  const totalStories = stories.length;
  const totalQuizzes = quizzes.length;
  const avgAccuracy = quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + q.accuracy, 0) / quizzes.length)
    : 0;

  const storyStats = stories.map(story => {
    const storyQuizzes = quizzes.filter(q => q.storyId.toString() === story._id.toString());
    const bestScore = storyQuizzes.length > 0
      ? Math.max(...storyQuizzes.map(q => q.accuracy))
      : 0;
    const lastQuiz = storyQuizzes.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

    return {
      storyId: story._id,
      title: story.title,
      icon: story.icon,
      totalQuizzes: storyQuizzes.length,
      bestAccuracy: bestScore,
      lastAccuracy: lastQuiz?.accuracy || 0,
      lastAttempt: lastQuiz?.completedAt || null,
    };
  });

  res.json({
    success: true,
    data: {
      totalStories,
      totalQuizzes,
      avgAccuracy,
      storyStats,
    },
  });
});

module.exports = {
  createStory,
  getStoriesForPatient,
  getStoriesByCaregiver,
  getStoryById,
  updateStory,
  deleteStory,
  submitQuiz,
  getQuizResults,
  getStoryStats,
};
