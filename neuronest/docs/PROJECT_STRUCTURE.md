# NeuroNest Project Structure

This document provides a detailed overview of the project's folder and file organization.

## 📁 Complete Directory Structure

```
neuronest/
│
├── backend/                           # Node.js + Express Backend
│   ├── config/                       # Configuration files
│   │   └── db.js                     # MongoDB connection setup
│   │
│   ├── constants/                    # Backend constants
│   │   ├── alertTypes.js            # Alert type and severity constants
│   │   ├── gameTypes.js             # Game and difficulty constants
│   │   ├── httpStatus.js            # HTTP status codes
│   │   └── index.js                 # Constants index export
│   │
│   ├── controllers/                  # Route controllers (business logic)
│   │   ├── alertController.js       # Alert management endpoints
│   │   ├── caregiverController.js   # Caregiver dashboard endpoints
│   │   ├── gameScoreController.js   # Game score tracking endpoints
│   │   ├── moodController.js        # Mood check-in endpoints
│   │   ├── patientController.js     # Patient CRUD endpoints
│   │   ├── reminderController.js    # Reminder management endpoints
│   │   └── voiceController.js       # Voice command processing
│   │
│   ├── middleware/                   # Express middleware
│   │   └── errorHandler.js          # Global error handling
│   │
│   ├── models/                       # Mongoose schemas
│   │   ├── Alert.js                 # Alert data model
│   │   ├── Caregiver.js             # Caregiver data model
│   │   ├── GameScore.js             # Game score data model
│   │   ├── MoodCheckin.js           # Mood check-in data model
│   │   ├── Patient.js               # Patient data model
│   │   └── Reminder.js              # Reminder data model
│   │
│   ├── routes/                       # API route definitions
│   │   ├── alertRoutes.js           # /api/alerts endpoints
│   │   ├── caregiverRoutes.js       # /api/caregivers endpoints
│   │   ├── moodRoutes.js            # /api/mood endpoints
│   │   ├── patientRoutes.js         # /api/patients endpoints
│   │   ├── reminderRoutes.js        # /api/reminders endpoints
│   │   ├── scoreRoutes.js           # /api/scores endpoints
│   │   └── voiceRoutes.js           # /api/voice endpoints
│   │
│   ├── services/                     # Business logic services
│   │   ├── adaptiveDifficultyService.js  # AI difficulty adjustment
│   │   ├── alertService.js               # Alert generation logic
│   │   └── index.js                      # Services index export
│   │
│   ├── utils/                        # Utility functions
│   │   ├── memoryDb.js              # In-memory cache
│   │   ├── modelResolver.js         # Dynamic model loading
│   │   └── seed.js                  # Database seeding script
│   │
│   ├── validators/                   # Input validation
│   │   ├── gameScoreValidator.js    # Game score validation rules
│   │   ├── patientValidator.js      # Patient validation rules
│   │   └── index.js                 # Validators index export
│   │
│   ├── .env.example                 # Environment variables template
│   ├── .eslintrc.json              # ESLint configuration
│   ├── package.json                # Dependencies and scripts
│   └── server.js                   # Express app entry point
│
├── frontend/                        # React + Vite Frontend
│   ├── public/                     # Static assets
│   │   ├── favicon.svg
│   │   ├── icon-192.png           # PWA icon (192x192)
│   │   └── icon-512.png           # PWA icon (512x512)
│   │
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── features/          # Feature-specific components
│   │   │   │   ├── OfflineBanner.jsx         # Offline mode indicator
│   │   │   │   ├── VoiceAssistantButton.jsx  # Voice command button
│   │   │   │   └── index.js                  # Features export
│   │   │   │
│   │   │   ├── layout/            # Layout components
│   │   │   │   ├── NavBar.jsx                # Main navigation bar
│   │   │   │   └── index.js                  # Layout export
│   │   │   │
│   │   │   ├── ui/                # Reusable UI components
│   │   │   │   ├── Animated3DBackground.jsx  # Canvas particle system
│   │   │   │   ├── AnimatedBackground.jsx    # Background animations
│   │   │   │   ├── BigButton.jsx             # Large accessible button
│   │   │   │   ├── Card.jsx                  # Glass card component
│   │   │   │   └── index.js                  # UI components export
│   │   │   │
│   │   │   └── index.js           # All components export
│   │   │
│   │   ├── constants/             # Frontend constants
│   │   │   ├── gameTypes.js      # Game type constants
│   │   │   ├── languages.js      # Language and font size constants
│   │   │   ├── moods.js          # Mood type constants
│   │   │   ├── reminders.js      # Reminder type constants
│   │   │   ├── routes.js         # Route path constants
│   │   │   └── index.js          # Constants index export
│   │   │
│   │   ├── context/              # React Context providers
│   │   │   ├── LanguageContext.jsx    # i18n state management
│   │   │   └── PatientContext.jsx     # Patient auth and state
│   │   │
│   │   ├── games/                # Cognitive game components
│   │   │   ├── DailyRoutineRecallGame.jsx   # Daily routine game
│   │   │   ├── MemoryMatchGame.jsx          # Memory card game
│   │   │   ├── PatternRecognitionGame.jsx   # Pattern game
│   │   │   └── index.js                     # Games export
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useOfflineSync.js      # PWA offline sync hook
│   │   │   └── useVoiceAssistant.js   # Voice commands hook
│   │   │
│   │   ├── i18n/                 # Translation files
│   │   │   ├── en.json           # English translations
│   │   │   ├── hi.json           # Hindi translations
│   │   │   ├── bn.json           # Bengali translations
│   │   │   ├── as.json           # Assamese translations
│   │   │   ├── kha.json          # Khasi translations
│   │   │   ├── mni.json          # Manipuri translations
│   │   │   └── mzo.json          # Mizo translations
│   │   │
│   │   ├── pages/                # Route page components
│   │   │   ├── CaregiverPage.jsx      # Caregiver dashboard
│   │   │   ├── GamesPage.jsx          # Games menu
│   │   │   ├── HomePage.jsx           # Patient home screen
│   │   │   ├── RemindersPage.jsx      # Reminders management
│   │   │   ├── SettingsPage.jsx       # App settings
│   │   │   ├── WelcomePage.jsx        # Landing page
│   │   │   └── index.js               # Pages export
│   │   │
│   │   ├── services/             # API and service layer
│   │   │   ├── api.js                 # API client functions
│   │   │   ├── offlineSync.js         # PWA sync service
│   │   │   └── index.js               # Services export
│   │   │
│   │   ├── App.jsx               # Main app component
│   │   ├── index.css             # Global styles (Tailwind + Custom)
│   │   └── main.jsx              # React entry point
│   │
│   ├── .eslintrc.json           # ESLint configuration
│   ├── index.html               # HTML template
│   ├── package.json             # Dependencies and scripts
│   ├── postcss.config.js        # PostCSS configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   └── vite.config.js           # Vite bundler config
│
├── docs/                         # Project documentation
│   ├── archive/                 # Old documentation files
│   │   ├── BRENDON_WRIGHT_REPLICA_COMPLETE.md
│   │   ├── DESIGN_UPGRADE_README.md
│   │   ├── FINAL_FIXES_SUMMARY.md
│   │   └── MODERN_DESIGN_UPDATE.md
│   │
│   ├── API.md                   # API endpoint documentation
│   ├── ARCHITECTURE.md          # System architecture guide
│   └── CONTRIBUTING.md          # Contribution guidelines
│
├── .editorconfig                # Editor configuration
├── .gitignore                   # Git ignore rules
├── .prettierignore              # Prettier ignore rules
├── .prettierrc                  # Prettier code formatting config
├── LICENSE                      # MIT License
├── PROJECT_STRUCTURE.md         # This file
├── README.md                    # Main project documentation
├── START_NEURONEST.bat         # Windows startup script (both servers)
├── START_NEURONEST.vbs         # Silent Windows startup
├── _run_backend.bat            # Backend-only startup
└── _run_frontend.bat           # Frontend-only startup
```

## 🎯 Organization Principles

### Backend Organization

**MVC Pattern**:
- **Models** (`/models`): Data structure and database schemas
- **Views**: JSON responses (no template engine)
- **Controllers** (`/controllers`): Request handling and response logic

**Separation of Concerns**:
- **Routes**: Define endpoints and map to controllers
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic (alerts, difficulty calculation)
- **Validators**: Input validation rules
- **Middleware**: Cross-cutting concerns (error handling)
- **Utils**: Helper functions and tools

### Frontend Organization

**Component Structure**:
- **UI Components** (`/components/ui`): Reusable visual elements
- **Layout Components** (`/components/layout`): Structural components (navbar, etc.)
- **Feature Components** (`/components/features`): Feature-specific components
- **Page Components** (`/pages`): Route-level container components
- **Game Components** (`/games`): Self-contained game modules

**State Management**:
- **Context**: Global state (patient, language)
- **Local State**: Component-specific state (useState)
- **Hooks**: Reusable stateful logic

**Code Organization**:
- **Constants**: Centralized constant values
- **Services**: API calls and external services
- **Hooks**: Custom React hooks
- **i18n**: Internationalization files

## 📝 File Naming Conventions

### Backend (Node.js)
- **Files**: camelCase.js (`patientController.js`)
- **Classes**: PascalCase (`class Patient`)
- **Functions**: camelCase (`function getPatient()`)
- **Constants**: UPPER_SNAKE_CASE (`const HTTP_STATUS`)
- **Models**: PascalCase (`Patient.js`)

### Frontend (React)
- **Components**: PascalCase.jsx (`NavBar.jsx`)
- **Utilities**: camelCase.js (`offlineSync.js`)
- **Constants**: camelCase.js (`gameTypes.js`)
- **Hooks**: camelCase starting with 'use' (`useVoiceAssistant.js`)
- **Styles**: kebab-case.css (`custom-styles.css`)

## 🔄 Import/Export Patterns

### Backend (CommonJS)
```javascript
// Export
module.exports = { function1, function2 };

// Import
const { function1 } = require('./module');
```

### Frontend (ES6 Modules)
```javascript
// Named exports
export const Component1 = () => {};
export { Component2 };

// Default export
export default Component;

// Import
import Component from './Component';
import { Component1, Component2 } from './components';
```

## 🗂️ Index Files

Index files (`index.js`) serve as aggregation points for cleaner imports:

```javascript
// Instead of:
import NavBar from './components/layout/NavBar';
import Card from './components/ui/Card';

// Use:
import { NavBar } from './components/layout';
import { Card } from './components/ui';
```

## 📦 Key Directories Explained

| Directory | Purpose | Pattern |
|-----------|---------|---------|
| `/backend/controllers` | HTTP request handlers | Controller per resource |
| `/backend/models` | Database schemas | Model per entity |
| `/backend/routes` | API endpoints | Route file per resource |
| `/backend/services` | Business logic | Service per domain |
| `/frontend/pages` | Route components | Component per route |
| `/frontend/components` | Reusable UI | Categorized by type |
| `/frontend/games` | Game modules | Game per file |
| `/constants` | Constants | Category per file |

## 🚀 Benefits of This Structure

1. **Scalability**: Easy to add new features without cluttering
2. **Maintainability**: Clear separation of concerns
3. **Testability**: Isolated units easy to test
4. **Discoverability**: Logical organization, easy to find files
5. **Consistency**: Uniform patterns across codebase
6. **Collaboration**: Clear conventions for team work

## 📚 Related Documentation

- [README.md](README.md) - Project overview and setup
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture details
- [CONTRIBUTING.md](docs/CONTRIBUTING.md) - Contribution guidelines
- [API.md](docs/API.md) - API endpoint documentation

---

**Last Updated**: August 30, 2026
