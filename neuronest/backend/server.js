require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const connectDB = require('./config/db');
const { setMemoryMode } = require('./utils/modelResolver');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const patientRoutes = require('./routes/patientRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const alertRoutes = require('./routes/alertRoutes');
const moodRoutes = require('./routes/moodRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve frontend build FIRST
const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendBuild));

// API health
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const connected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    mode: connected ? 'mongodb' : 'memory',
    dbState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
  });
});

// API routes
app.use('/api/patients', patientRoutes);
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/voice', voiceRoutes);

// SPA fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendBuild, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.log('   Switching to in-memory database (data will not persist after restart)');
    setMemoryMode(true);
  } else {
    setMemoryMode(false);
  }

  app.listen(PORT, () => {
    const mode = dbConnected ? 'MongoDB' : 'In-Memory';
    console.log(`\n  NeuroNest running at http://localhost:${PORT}  [${mode}]\n`);
  });
}

start();

module.exports = app;
