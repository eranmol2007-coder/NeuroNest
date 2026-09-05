# NeuroNest

> AI-Powered Cognitive Care Platform for Dementia Patients and Caregivers

NeuroNest is a full-stack web application designed to support individuals with dementia and their caregivers through cognitive games, voice-assisted navigation, medication reminders, mood tracking, caregiver monitoring, and AI-driven reminiscence therapy with multilingual speech synthesis.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Development](#development)

## Features

### Authentication
- OTP-based sign in / sign up for patients and caregivers
- Role-based access (patient vs caregiver)
- Caregiver-patient linking

### For Patients
- **Cognitive Games** - Memory Match, Pattern Recognition, Daily Routine Recall with adaptive difficulty
- **Voice Assistant** - Hands-free voice commands for navigation and app control
- **Reminiscence Therapy** - Interactive storybooks with 6 themes, 4 chapters each, personalized text, speech synthesis narration, mood tracking before/after stories
- **Medication Reminders** - Customizable recurring reminders
- **Mood Tracking** - Daily emotional check-ins with visual journaling
- **Multilingual Support** - 9 languages: English, Hindi, Bengali, Assamese, Khasi, Mizo, Nagamese, Manipuri, Nepali

### For Caregivers
- **Dashboard** - Monitor patient cognitive performance and mood trends
- **Alert System** - Automated alerts for missed reminders and concerning patterns
- **Analytics** - Visual charts tracking accuracy, mood, and game performance
- **Patient Management** - Link and monitor multiple patients

### Technical
- **Adaptive Difficulty Engine** - AI-powered game difficulty adjustment based on performance
- **Linguistic Decay Detector** - Simplifies voice assistant responses for cognitive accessibility
- **PWA** - Progressive Web App with offline support
- **In-Memory DB Fallback** - Works without MongoDB using persistent in-memory database
- **3D Animations** - Green glass morphism design with animated backgrounds

## Tech Stack

### Frontend
- React 18 + Vite 5
- React Router DOM 6
- Tailwind CSS + Custom Glass Morphism CSS
- Chart.js for analytics
- Web Speech API (recognition + synthesis)
- Vite PWA plugin

### Backend
- Node.js 18+ / Express 4
- MongoDB with Mongoose (optional - in-memory fallback available)
- Helmet, CORS, Compression, Morgan

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (optional - app works without it using in-memory DB)

### Install Dependencies

```bash
# From project root (neuronest/)
cd backend
npm install

cd ../frontend
npm install
```

### Start the App

**Terminal 1 - Backend:**
```bash
cd neuronest/backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd neuronest/frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

The Vite dev server proxies `/api/*` requests to the backend automatically.

## Project Structure

```
neuronest/
├── backend/
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── constants/
│   ├── controllers/
│   │   ├── alertController.js
│   │   ├── authController.js          # OTP auth (patient + caregiver)
│   │   ├── caregiverController.js
│   │   ├── gameScoreController.js
│   │   ├── moodController.js
│   │   ├── patientController.js
│   │   ├── reminderController.js
│   │   ├── reminiscenceController.js  # 6 themes, 4 chapters, 9 languages
│   │   └── voiceController.js         # Voice intent recognition
│   ├── data/
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Alert.js
│   │   ├── Caregiver.js
│   │   ├── GameScore.js
│   │   ├── MoodCheckin.js
│   │   ├── Otp.js                    # OTP verification
│   │   ├── Patient.js
│   │   ├── Reminder.js
│   │   └── User.js                   # Patient + caregiver roles
│   ├── routes/
│   │   ├── alertRoutes.js
│   │   ├── authRoutes.js             # /api/auth/*
│   │   ├── caregiverRoutes.js
│   │   ├── moodRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── reminderRoutes.js
│   │   ├── reminiscenceRoutes.js     # /api/reminiscence/*
│   │   ├── scoreRoutes.js
│   │   └── voiceRoutes.js
│   ├── services/
│   │   ├── adaptiveDifficultyService.js
│   │   └── alertService.js
│   ├── utils/
│   │   ├── memoryDb.js               # In-memory DB with file persistence
│   │   ├── modelResolver.js          # Resolves Mongo or memory models
│   │   └── seed.js
│   ├── validators/
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── OfflineBanner.jsx
│   │   │   │   └── VoiceAssistantButton.jsx
│   │   │   ├── layout/
│   │   │   │   └── NavBar.jsx         # Floating nav: Home Stories Games Reminders Caregiver Settings
│   │   │   └── ui/
│   │   │       ├── Animated3DBackground.jsx
│   │   │       ├── AnimatedBackground.jsx
│   │   │       ├── BigButton.jsx
│   │   │       └── Card.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # User/patient/caregiver state
│   │   │   ├── LanguageContext.jsx    # 9-language support + decay detector
│   │   │   └── PatientContext.jsx
│   │   ├── games/
│   │   │   ├── DailyRoutineRecallGame.jsx
│   │   │   ├── MemoryMatchGame.jsx
│   │   │   └── PatternRecognitionGame.jsx
│   │   ├── hooks/
│   │   │   ├── useOfflineSync.js
│   │   │   └── useVoiceAssistant.js  # Voice commands + client-side navigation
│   │   ├── i18n/
│   │   │   ├── en.json, hi.json, bn.json, as.json, kha.json, mzo.json,
│   │   │   │   nagamese.json, mni.json, ne.json
│   │   │   └── reminiscence.js       # Translated chapter texts for 9 languages
│   │   ├── pages/
│   │   │   ├── CaregiverPage.jsx
│   │   │   ├── GamesPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── RemindersPage.jsx
│   │   │   ├── ReminiscencePage.jsx  # Interactive storybook with speech synthesis
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── SignInPage.jsx         # OTP sign in (patient/caregiver tabs)
│   │   │   ├── SignUpPage.jsx         # OTP sign up (patient/caregiver tabs)
│   │   │   └── WelcomePage.jsx
│   │   ├── services/
│   │   │   ├── api.js                # API client + reminiscence helpers
│   │   │   ├── linguisticDecay.js    # Cognitive simplification engine
│   │   │   └── offlineSync.js
│   │   ├── App.jsx                    # Routes with auth guards
│   │   ├── index.css                  # Global styles + reminiscence CSS
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js                 # PWA + API proxy config
│   └── package.json
│
├── docs/
├── scripts/
├── LICENSE
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email/phone
- `POST /api/auth/verify-otp` - Verify OTP and sign in/up
- `GET /api/auth/me` - Get current user with role and patient data

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Game Scores
- `POST /api/scores` - Submit game score
- `GET /api/scores/patient/:patientId` - Get patient scores
- `GET /api/scores/analytics/:patientId` - Performance analytics

### Mood Tracking
- `POST /api/mood` - Submit mood check-in
- `GET /api/mood/patient/:patientId` - Mood history
- `GET /api/mood/trend/:patientId` - Mood trend data

### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders/patient/:patientId` - Patient reminders
- `PUT /api/reminders/:id/complete` - Mark complete
- `DELETE /api/reminders/:id` - Delete reminder

### Reminiscence Therapy
- `GET /api/reminiscence/themes` - List all themes with chapters
- `POST /api/reminiscence/story` - Generate personalized story
- `GET /api/reminiscence/chapter/:themeKey/:index` - Get specific chapter
- `POST /api/reminiscence/interaction` - Record interaction
- `GET /api/reminiscence/progress/:patientId` - Get progress

### Caregivers
- `POST /api/caregivers` - Create caregiver
- `GET /api/caregivers/:id/dashboard` - Dashboard with analytics

### Alerts
- `GET /api/alerts/patient/:patientId` - Patient alerts
- `PUT /api/alerts/:id/resolve` - Resolve alert

### Voice
- `POST /api/voice/intent` - Process voice command (navigate, reminder, mood, game)

## Development

### Backend
```bash
cd backend
node server.js          # Start server on port 5000
```

### Frontend
```bash
cd frontend
npm run dev             # Start Vite dev server on port 5173
npm run build           # Production build
```

### Environment Variables

Backend `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neuronest
NODE_ENV=development
```

If `MONGODB_URI` is not set or MongoDB is unavailable, the app automatically falls back to an in-memory database with file persistence.

---

Built for dementia care and cognitive health.
