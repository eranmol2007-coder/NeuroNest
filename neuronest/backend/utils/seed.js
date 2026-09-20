/**
 * Seed script — populates the database with one demo patient, one
 * caregiver, sample game scores, reminders, mood check-ins, and an
 * alert, so the app has content to show immediately after setup.
 *
 * Run with: npm run seed  (from the backend/ folder)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Patient = require('../models/Patient');
const Caregiver = require('../models/Caregiver');
const GameScore = require('../models/GameScore');
const Reminder = require('../models/Reminder');
const Alert = require('../models/Alert');
const MoodCheckin = require('../models/MoodCheckin');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function seed() {
  await connectDB();

  console.log('🧹 Clearing existing demo collections...');
  await Promise.all([
    Patient.deleteMany({}),
    Caregiver.deleteMany({}),
    GameScore.deleteMany({}),
    Reminder.deleteMany({}),
    Alert.deleteMany({}),
    MoodCheckin.deleteMany({}),
  ]);

  console.log('👤 Creating demo patient...');
  const patient = await Patient.create({
    name: 'Ao Longkumer',
    age: 74,
    language: 'Nagamese',
    gender: 'Male',
    currentDifficulty: 'medium',
    fontSizePreference: 'large',
    voiceVolume: 75,
  });

  console.log('🧑‍⚕️ Creating demo caregiver...');
  const caregiver = await Caregiver.create({
    name: 'Imnala Longkumer',
    email: 'imnala@example.com',
    phone: '+91-9000000000',
    relationToPatient: 'Daughter',
    linkedPatientId: patient._id,
  });

  patient.caregiverId = caregiver._id;
  await patient.save();

  console.log('🎮 Creating sample game scores (last 10 days)...');
  const gameTypes = ['memoryMatch', 'patternRecognition', 'dailyRoutineRecall'];
  const scores = [];
  for (let i = 9; i >= 0; i--) {
    const gameType = gameTypes[i % gameTypes.length];
    // simulate a gentle decline in the most recent 3 entries to demo the alert engine
    const isRecentDip = i <= 2;
    const accuracy = isRecentDip
      ? 45 + Math.floor(Math.random() * 10)
      : 70 + Math.floor(Math.random() * 25);
    scores.push({
      patientId: patient._id,
      gameType,
      accuracy,
      timeTaken: 50 + Math.floor(Math.random() * 60),
      difficulty: 'medium',
      nextDifficulty: accuracy >= 85 ? 'hard' : accuracy < 50 ? 'easy' : 'medium',
      date: daysAgo(i),
    });
  }
  await GameScore.insertMany(scores);
  patient.gameHistory = scores.map((s) => ({
    gameType: s.gameType,
    accuracy: s.accuracy,
    timeTaken: s.timeTaken,
    difficulty: s.difficulty,
    date: s.date,
  }));
  await patient.save();

  console.log('⏰ Creating sample reminders...');
  await Reminder.insertMany([
    {
      patientId: patient._id,
      type: 'medicine',
      title: 'Morning Blood Pressure Tablet',
      notes: 'One tablet after breakfast',
      time: '08:00',
      isRecurring: true,
      status: 'pending',
    },
    {
      patientId: patient._id,
      type: 'water',
      title: 'Drink a glass of water',
      time: '11:00',
      isRecurring: true,
      status: 'completed',
      lastCompletedAt: new Date(),
    },
    {
      patientId: patient._id,
      type: 'appointment',
      title: 'Dr. Imti Check-up',
      notes: 'District Hospital, Room 4',
      time: '2026-09-05T10:30',
      isRecurring: false,
      status: 'pending',
    },
    {
      patientId: patient._id,
      type: 'medicine',
      title: 'Evening Medicine',
      time: '20:00',
      isRecurring: true,
      status: 'pending',
    },
  ]);

  console.log('😊 Creating sample mood check-ins (last 7 days)...');
  const moods = ['good', 'okay', 'good', 'great', 'okay', 'low', 'okay'];
  const moodDocs = moods.map((mood, idx) => ({
    patientId: patient._id,
    mood,
    moodScore: MoodCheckin.scoreForMood(mood),
    date: daysAgo(6 - idx),
  }));
  await MoodCheckin.insertMany(moodDocs);

  console.log('🚨 Creating a sample alert...');
  await Alert.create({
    patientId: patient._id,
    type: 'low_accuracy',
    severity: 'warning',
    message:
      'Accuracy has dropped from an average of 82% to 49% over recent games. Consider checking in with the patient.',
  });

  console.log('\n✅ Seed complete!');
  console.log(`   Patient ID:   ${patient._id}`);
  console.log(`   Caregiver ID: ${caregiver._id}`);
  console.log('   Use these IDs to log in on the frontend demo selector.\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
