const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');
const { scoreAnswer } = require('../services/storyScoringService');

const createStory = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const { caregiverId, patientId, title, description, icon, color, imageUrl, chapters, questions, language } = req.body;

  if (!caregiverId || !patientId || !title) {
    res.status(400);
    throw new Error('caregiverId, patientId, and title are required');
  }

  if (!chapters || chapters.length === 0) {
    res.status(400);
    throw new Error('At least one chapter is required');
  }

  const story = await PersonalStory.create({
    caregiverId, patientId, title, description, icon, color, imageUrl: imageUrl || '',
    chapters, questions: questions || [],
    language: language || 'English',
    isPublished: true,
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

  const allowed = ['title', 'description', 'icon', 'color', 'imageUrl', 'chapters', 'questions', 'language', 'isPublished'];
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
  const { storyId, patientId, answers, score: preScore, totalQuestions: preTotal, accuracy: preAccuracy, storyTitle } = req.body;

  if (!storyId || !patientId || !answers) {
    res.status(400);
    throw new Error('storyId, patientId, and answers are required');
  }

  let score = 0;
  let totalQuestions = 0;
  let processedAnswers;

  if (preScore !== undefined && preTotal !== undefined && preAccuracy !== undefined) {
    score = preScore;
    totalQuestions = preTotal;
    processedAnswers = answers.map((ans, idx) => ({
      questionIndex: idx, selectedAnswer: ans.selectedAnswer, isCorrect: ans.isCorrect || false,
    }));
  } else {
    const story = await PersonalStory.findById(storyId);
    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }
    totalQuestions = story.questions.length;

    // Use AI semantic scoring for each answer
    const scoringResults = await Promise.all(
      answers.map(async (ans, idx) => {
        const question = story.questions[idx];
        if (!question) return { isCorrect: false, aiScore: 0 };

        const patientAnswer = ans.selectedAnswer || '';
        const correctAnswer = question.correctAnswer || '';
        const keywords = question.keywords || [];

        const aiResult = await scoreAnswer(patientAnswer, correctAnswer, keywords);

        // Consider correct if AI score >= 50% OR exact match
        const isCorrect = aiResult.score >= 50 || patientAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

        return { isCorrect, aiScore: aiResult.score, source: aiResult.source };
      })
    );

    processedAnswers = answers.map((ans, idx) => {
      if (scoringResults[idx].isCorrect) score++;
      return {
        questionIndex: idx,
        selectedAnswer: ans.selectedAnswer,
        isCorrect: scoringResults[idx].isCorrect,
        aiScore: scoringResults[idx].aiScore,
        scoringSource: scoringResults[idx].source,
      };
    });
  }

  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const quiz = await StoryQuiz.create({
    patientId, storyId,
    answers: processedAnswers,
    score, totalQuestions, accuracy,
    storyTitle: storyTitle || '',
    completedAt: new Date(),
  });

  res.status(201).json({ success: true, data: quiz });
});

const getQuizResults = asyncHandler(async (req, res) => {
  const { StoryQuiz, PersonalStory } = getModels();
  const results = await StoryQuiz.find({ patientId: req.params.patientId })
    .populate('storyId', 'title icon')
    .sort({ completedAt: -1 });

  const enriched = await Promise.all(results.map(async (q) => {
    const obj = typeof q.toObject === 'function' ? q.toObject() : { ...q };
    // Ensure storyTitle is populated
    if (!obj.storyTitle && obj.storyId) {
      if (typeof obj.storyId === 'object' && obj.storyId.title) {
        obj.storyTitle = obj.storyId.title;
      } else if (typeof obj.storyId === 'string' || typeof obj.storyId === 'number') {
        try {
          const story = await PersonalStory.findById(obj.storyId);
          if (story) obj.storyTitle = story.title;
        } catch {}
      }
    }
    return obj;
  }));

  res.json({ success: true, count: enriched.length, data: enriched });
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

const generateQuizFromStory = asyncHandler(async (req, res) => {
  const { PersonalStory } = getModels();
  const story = await PersonalStory.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }

  if (story.questions && story.questions.length > 0) {
    return res.json({ success: true, data: story.questions, source: 'caregiver' });
  }

  const generated = [];
  const chapters = story.chapters || [];

  if (chapters.length === 0) {
    return res.json({ success: true, data: [], source: 'none' });
  }

  // Extract meaningful words from full story text (stopwords removed)
  const stopwords = new Set(['the','and','but','with','from','that','this','were','been','have','will','would','could','should','their','there','they','what','when','where','which','about','into','over','such','after','before','first','last','very','some','just','only','also','than','then','like','make','take','come','know','back','well','your','them','each','much','must','its','our','are','was','had','did','got','let','say','she','him','his','her','how','man','old','new','two','way','may','day','too','any','few','lot','own','put','end','big','ask','top','off','run','try','set','still','even','most','much','made','find','here','thing','many','time','long','great','little','just','over','such','take','year','them','some','come','made','could','house','door','would']);

  function extractKeywords(text) {
    return text.split(/\s+/)
      .map(w => w.replace(/[.,!?;:'"()]/g, '').toLowerCase())
      .filter(w => w.length > 3 && !stopwords.has(w));
  }

  function extractSentenceKeywords(sentence) {
    return extractKeywords(sentence);
  }

  // Q1: Overall comprehension — what is this story about?
  if (chapters.length >= 1) {
    const firstChapterText = chapters[0].text || '';
    const firstChapterTitle = chapters[0].title || 'the first chapter';
    const storyTitle = story.title || 'this story';
    const keywords = extractKeywords(firstChapterText).slice(0, 6);
    if (keywords.length >= 2) {
      generated.push({
        question: `What is "${storyTitle}" mainly about? Describe in your own words.`,
        correctAnswer: `The story is about ${storyTitle.toLowerCase()}, starting with ${firstChapterTitle.toLowerCase()} and the memories associated with it.`,
        keywords,
        type: 'subjective',
      });
    }
  }

  // Q2-Q3: Detail questions from each chapter
  chapters.forEach((ch, idx) => {
    if (!ch.text || ch.text.length < 30) return;
    const sentences = ch.text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    if (sentences.length === 0) return;

    // Pick a sentence with good detail
    const detailSentence = sentences.find(s => s.length > 30) || sentences[0];
    const sentenceKeywords = extractSentenceKeywords(detailSentence);
    const shortAnswer = detailSentence.length > 100 ? detailSentence.substring(0, 100) + '...' : detailSentence;

    if (sentenceKeywords.length >= 2) {
      generated.push({
        question: `In Chapter ${idx + 1} ("${ch.title}"), describe what you remember about this part of the story.`,
        correctAnswer: shortAnswer,
        keywords: sentenceKeywords.slice(0, 5),
        type: 'subjective',
      });
    }
  });

  // Q4: Sensory/emotional detail
  if (chapters.length >= 1) {
    const ch = chapters[0];
    if (ch.text && ch.text.length > 30) {
      const sentences = ch.text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
      const sensoryWords = ['smell','scent','aroma','sound','noise','voice','touch','feel','warm','cold','light','dark','bright','soft','hard','sweet','bitter','loud','quiet','gentle','rough','smooth','fresh','old','young','happy','sad','joy','love','miss','remember','dream','laugh','cry','sing','dance','play','run','walk','sit','stand','look','watch','listen','hear','taste','eat','drink','cook','bake'];
      const sensorySentence = sentences.find(s => {
        const lower = s.toLowerCase();
        return sensoryWords.some(w => lower.includes(w));
      }) || sentences[0];

      if (sensorySentence) {
        const keywords = extractSentenceKeywords(sensorySentence).slice(0, 5);
        generated.push({
          question: `What sights, sounds, or feelings does the story describe? Give an example from the text.`,
          correctAnswer: sensorySentence.length > 100 ? sensorySentence.substring(0, 100) + '...' : sensorySentence,
          keywords,
          type: 'subjective',
        });
      }
    }
  }

  // Q5: Personal connection
  if (chapters.length >= 1) {
    const ch = chapters[chapters.length - 1];
    const keywords = extractKeywords(ch.text || '').slice(0, 4);
    generated.push({
      question: `How does the ending of the story make you feel? What does it remind you of in your own life?`,
      correctAnswer: `The story ends with ${ch.title ? ch.title.toLowerCase() : 'memories'}, evoking feelings of nostalgia and personal connection.`,
      keywords: keywords.length >= 2 ? keywords : ['memory', 'feel', 'remember', 'story'],
      type: 'subjective',
    });
  }

  // Q6: Favorite part
  if (chapters.length > 1) {
    const titles = chapters.map(c => c.title).filter(Boolean);
    generated.push({
      question: `Which part of the story did you find most meaningful and why?`,
      correctAnswer: `Any chapter from the story — the reader should reference a specific part: ${titles.join(', ')}.`,
      keywords: extractKeywords(story.chapters.map(c => c.text || '').join(' ')).slice(0, 5),
      type: 'subjective',
    });
  }

  // Q7: Memory recall
  if (chapters.length >= 2) {
    const ch = chapters[1];
    const keywords = extractKeywords(ch.text || '').slice(0, 5);
    generated.push({
      question: `What happens in the second part of the story? Describe the scene or events.`,
      correctAnswer: ch.text ? (ch.text.length > 100 ? ch.text.substring(0, 100) + '...' : ch.text) : 'The story describes memories from the second chapter.',
      keywords: keywords.length >= 2 ? keywords : ['chapter', 'story', 'memory'],
      type: 'subjective',
    });
  }

  const shuffled = generated.sort(() => Math.random() - 0.5).slice(0, Math.min(7, generated.length));
  res.json({ success: true, data: shuffled, source: 'auto' });
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
  generateQuizFromStory,
};
