const asyncHandler = require('express-async-handler');
const { getModels } = require('../utils/modelResolver');
const { decideNextDifficulty } = require('../services/adaptiveDifficultyService');
const { checkAccuracyAlert } = require('../services/alertService');

const submitScore = asyncHandler(async (req, res) => {
  const { Patient, GameScore, Alert } = getModels();
  const { patientId, gameType, accuracy, timeTaken, difficulty } = req.body;

  if (!patientId || !gameType || accuracy === undefined || timeTaken === undefined || !difficulty) {
    res.status(400);
    throw new Error('patientId, gameType, accuracy, timeTaken, and difficulty are all required');
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const { nextDifficulty, direction, reason } = decideNextDifficulty({
    accuracy, timeTaken, difficulty, gameType,
  });

  const score = await GameScore.create({
    patientId, gameType, accuracy, timeTaken, difficulty, nextDifficulty, date: new Date(),
  });

  patient.currentDifficulty = nextDifficulty;
  patient.gameHistory = patient.gameHistory || [];
  patient.gameHistory.push({ gameType, accuracy, timeTaken, difficulty, date: score.date });
  if (patient.gameHistory.length > 50) {
    patient.gameHistory = patient.gameHistory.slice(-50);
  }
  await patient.save();

  const recentScores = await GameScore.find({ patientId }).sort({ date: -1 }).limit(8);
  const alertPayload = checkAccuracyAlert(patientId, recentScores);
  let alertCreated = null;
  if (alertPayload) {
    alertCreated = await Alert.create(alertPayload);
  }

  res.status(201).json({
    success: true,
    data: {
      score,
      adaptiveDifficulty: { nextDifficulty, direction, reason },
      alertRaised: alertCreated,
    },
  });
});

const getScoresForPatient = asyncHandler(async (req, res) => {
  const { GameScore } = getModels();
  const { gameType, limit } = req.query;
  const query = { patientId: req.params.patientId };
  if (gameType) query.gameType = gameType;

  const scores = await GameScore.find(query)
    .sort({ date: -1 })
    .limit(limit ? parseInt(limit, 10) : 50);

  res.json({ success: true, count: scores.length, data: scores.reverse() });
});

const getPatientScoreSummary = asyncHandler(async (req, res) => {
  const { GameScore } = getModels();
  const scores = await GameScore.find({ patientId: req.params.patientId });

  if (scores.length === 0) {
    return res.json({
      success: true,
      data: { totalGames: 0, averageAccuracy: 0, byGameType: [] },
    });
  }

  const totalGames = scores.length;
  const averageAccuracy = Math.round(
    scores.reduce((s, sc) => s + sc.accuracy, 0) / totalGames
  );

  const grouped = {};
  scores.forEach((s) => {
    if (!grouped[s.gameType]) grouped[s.gameType] = [];
    grouped[s.gameType].push(s);
  });

  const byGameType = Object.entries(grouped).map(([gameType, arr]) => ({
    gameType,
    gamesPlayed: arr.length,
    averageAccuracy: Math.round(arr.reduce((s, a) => s + a.accuracy, 0) / arr.length),
    averageTime: Math.round(arr.reduce((s, a) => s + a.timeTaken, 0) / arr.length),
  }));

  res.json({ success: true, data: { totalGames, averageAccuracy, byGameType } });
});

module.exports = { submitScore, getScoresForPatient, getPatientScoreSummary };
