# NeuroNest Architecture Documentation

## System Overview

NeuroNest is a full-stack web application built with a modern MERN architecture (MongoDB, Express, React, Node.js) designed for scalability, maintainability, and accessibility.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  React SPA (Vite)                                           │
│  ├── Components (UI)                                         │
│  ├── Pages (Routes)                                          │
│  ├── Context (State)                                         │
│  ├── Hooks (Logic)                                           │
│  └── Utils (Helpers)                                         │
│                                                              │
│  Progressive Web App (PWA)                                   │
│  ├── Service Worker (Offline)                               │
│  ├── IndexedDB (Local Storage)                              │
│  └── Background Sync                                         │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js Server                                           │
│  ├── Routes (API Endpoints)                                  │
│  ├── Controllers (Business Logic)                            │
│  ├── Middleware (Auth, Error Handling)                       │
│  └── Utils (Adaptive Difficulty, Alert Engine)               │
└─────────────────────────────────────────────────────────────┘
                           ↓ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Database                                            │
│  ├── Patients Collection                                     │
│  ├── Caregivers Collection                                   │
│  ├── GameScores Collection                                   │
│  ├── MoodCheckins Collection                                 │
│  ├── Reminders Collection                                    │
│  └── Alerts Collection                                       │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: React 18.3 with Hooks
- **Build Tool**: Vite 5.4 (Fast HMR, optimized builds)
- **Routing**: React Router DOM 6.26
- **Styling**: Tailwind CSS 3.4 + Custom CSS
- **State Management**: React Context API
- **Storage**: IndexedDB for offline data
- **PWA**: Vite Plugin PWA with Workbox

### Directory Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── AnimatedBackground.jsx
│   ├── NavBar.jsx
│   ├── Card.jsx
│   └── ...
│
├── pages/              # Route-level components
│   ├── HomePage.jsx
│   ├── GamesPage.jsx
│   ├── MoodPage.jsx
│   └── ...
│
├── games/              # Game-specific components
│   ├── MemoryMatchGame.jsx
│   ├── PatternRecognitionGame.jsx
│   └── DailyRoutineRecallGame.jsx
│
├── context/            # Global state management
│   ├── PatientContext.jsx    # Patient data & auth
│   └── LanguageContext.jsx   # i18n state
│
├── hooks/              # Custom React hooks
│   ├── useOfflineSync.js     # PWA sync logic
│   └── useVoiceAssistant.js  # Voice command handling
│
├── utils/              # Helper functions
│   ├── api.js                # API client
│   └── offlineSync.js        # Offline queue management
│
├── i18n/               # Internationalization
│   ├── en.json
│   ├── hi.json
│   └── ...
│
├── App.jsx             # Main app component
├── main.jsx            # React entry point
└── index.css           # Global styles
```

### State Management

**Pattern**: React Context API for global state

```javascript
// PatientContext provides:
- patient: Current patient object
- setPatient: Update patient
- loading: Loading state
- error: Error state

// LanguageContext provides:
- language: Current language code
- setLanguage: Change language
- t: Translation function
```

**Why Context over Redux?**
- Simpler for app size
- Built-in to React
- Sufficient for non-complex state
- Easy to understand

### Component Architecture

**Pattern**: Functional components with hooks

```javascript
// Component structure:
1. Imports
2. Component definition
3. State hooks
4. Effect hooks
5. Helper functions
6. Event handlers
7. JSX return
```

**Component Types**:
1. **Page Components** - Route-level, container components
2. **UI Components** - Reusable, presentational components
3. **Game Components** - Self-contained game logic + UI
4. **Layout Components** - NavBar, Footer, etc.

### Data Flow

```
User Interaction
    ↓
Event Handler
    ↓
API Call (utils/api.js)
    ↓
Backend API
    ↓
Update State (Context or Local)
    ↓
Re-render Components
```

### Offline-First Strategy

1. **Service Worker** - Caches static assets and API responses
2. **IndexedDB** - Stores user data locally
3. **Background Sync** - Queues actions when offline
4. **Optimistic UI** - Updates UI immediately, syncs later

```javascript
// Offline flow:
1. User performs action (e.g., submit mood)
2. Update UI immediately (optimistic)
3. Queue action in IndexedDB
4. When online, sync queue to backend
5. Update UI with server response
```

## Backend Architecture

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4.19
- **Database**: MongoDB with Mongoose 8.5
- **Security**: Helmet, CORS
- **Performance**: Compression middleware

### Directory Structure

```
backend/
├── config/              # Configuration files
│   └── db.js           # MongoDB connection
│
├── models/             # Mongoose schemas
│   ├── Patient.js
│   ├── GameScore.js
│   ├── MoodCheckin.js
│   ├── Reminder.js
│   ├── Alert.js
│   └── Caregiver.js
│
├── controllers/        # Business logic
│   ├── patientController.js
│   ├── gameScoreController.js
│   ├── moodController.js
│   ├── reminderController.js
│   ├── alertController.js
│   ├── caregiverController.js
│   └── voiceController.js
│
├── routes/             # API route definitions
│   ├── patientRoutes.js
│   ├── scoreRoutes.js
│   ├── moodRoutes.js
│   ├── reminderRoutes.js
│   ├── alertRoutes.js
│   ├── caregiverRoutes.js
│   └── voiceRoutes.js
│
├── middleware/         # Express middleware
│   └── errorHandler.js  # Global error handling
│
├── utils/              # Utility functions
│   ├── adaptiveDifficulty.js  # AI difficulty logic
│   ├── alertEngine.js         # Alert generation
│   ├── memoryDb.js            # In-memory cache
│   ├── modelResolver.js       # Dynamic model loading
│   └── seed.js                # Database seeding
│
├── .env               # Environment variables
├── .env.example       # Env template
├── package.json       # Dependencies
└── server.js          # App entry point
```

### MVC Pattern

**Model**: Mongoose schemas define data structure
```javascript
const patientSchema = new Schema({
  name: { type: String, required: true },
  age: Number,
  currentDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  }
});
```

**Controller**: Business logic for routes
```javascript
const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  res.json({ patient });
});
```

**Route**: API endpoint definitions
```javascript
router.get('/:id', getPatient);
router.post('/', createPatient);
```

### API Design Principles

1. **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE)
2. **Resource-based**: URLs represent resources (/patients, /scores)
3. **Stateless**: Each request contains all needed information
4. **JSON**: Request and response bodies use JSON
5. **Error handling**: Consistent error format

### Error Handling

**Pattern**: Centralized error handler middleware

```javascript
// Controllers throw errors
throw new Error('Patient not found');

// Error handler catches and formats
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message,
      status: err.statusCode
    }
  });
});
```

## Database Design

### Schema Overview

```
Patients
├── _id (ObjectId)
├── name (String)
├── age (Number)
├── currentDifficulty (String: easy|medium|hard)
├── language (String)
├── fontSize (String)
├── caregiverId (ObjectId → Caregivers)
└── timestamps

GameScores
├── _id (ObjectId)
├── patientId (ObjectId → Patients)
├── gameType (String: memory_match|pattern_recognition|daily_routine)
├── difficulty (String: easy|medium|hard)
├── score (Number)
├── accuracy (Number)
├── timeSpent (Number)
├── attemptsUsed (Number)
└── date (Date)

MoodCheckins
├── _id (ObjectId)
├── patientId (ObjectId → Patients)
├── mood (String: happy|neutral|sad|anxious|calm)
├── moodScore (Number: 1-5)
├── notes (String)
└── date (Date)

Reminders
├── _id (ObjectId)
├── patientId (ObjectId → Patients)
├── type (String: medication|appointment|meal|activity|custom)
├── title (String)
├── time (String or Date)
├── isRecurring (Boolean)
├── notes (String)
├── completed (Boolean)
└── completedAt (Date)

Alerts
├── _id (ObjectId)
├── patientId (ObjectId → Patients)
├── type (String: low_performance|missed_reminder|mood_concern)
├── severity (String: low|medium|high)
├── message (String)
├── resolved (Boolean)
├── createdAt (Date)
└── resolvedAt (Date)

Caregivers
├── _id (ObjectId)
├── name (String)
├── email (String)
├── phone (String)
└── timestamps
```

### Indexing Strategy

```javascript
// Performance indexes
PatientSchema.index({ caregiverId: 1 });
GameScoreSchema.index({ patientId: 1, date: -1 });
MoodCheckinSchema.index({ patientId: 1, date: -1 });
ReminderSchema.index({ patientId: 1, completed: 1 });
AlertSchema.index({ patientId: 1, resolved: 1 });
```

### Relationships

- **One-to-Many**: Caregiver → Patients
- **One-to-Many**: Patient → GameScores, MoodCheckins, Reminders, Alerts
- **No Many-to-Many**: Simplified for MVP

## Key Features Architecture

### 1. Adaptive Difficulty System

**Algorithm**:
```javascript
function calculateDifficulty(recentScores) {
  // Analyze last 5 games
  const recent = scores.slice(-5);
  const avgAccuracy = average(recent.map(s => s.accuracy));
  
  // Adjust based on performance
  if (avgAccuracy >= 80) return 'hard';
  if (avgAccuracy >= 60) return 'medium';
  return 'easy';
}
```

**Trigger**: After each game submission
**Storage**: Updated in Patient.currentDifficulty

### 2. Alert Engine

**Rules**:
```javascript
// Low performance alert
if (recentAccuracy < 60 && games >= 3) {
  createAlert('low_performance', 'medium');
}

// Missed reminder alert
if (reminder.overdue > 30 minutes) {
  createAlert('missed_reminder', 'high');
}

// Mood concern alert
if (consecutiveLowMoods >= 3) {
  createAlert('mood_concern', 'high');
}
```

**Trigger**: Background check every 5 minutes (planned)
**Storage**: Alerts collection

### 3. Voice Assistant

**Architecture**:
1. Browser Speech Recognition API captures voice
2. Command parsed and matched to actions
3. Action executed (navigation, form fill, etc.)
4. Response spoken via Speech Synthesis API

**Commands**: Defined in voiceController.js

### 4. Internationalization (i18n)

**Implementation**:
```javascript
// Translation files: i18n/{lang}.json
{
  "home.greeting": "Welcome back",
  "mood.happy": "Happy"
}

// Usage in components:
const { t } = useLanguage();
return <h1>{t('home.greeting')}</h1>;
```

**Supported Languages**: en, hi, bn, as, kha, mni, mzo

## Security Considerations

### Current Implementation

1. **Helmet**: Sets security HTTP headers
2. **CORS**: Configured for allowed origins
3. **Input Validation**: Mongoose schema validation
4. **Error Messages**: Don't expose stack traces in production

### Planned (v2.0)

1. **Authentication**: JWT tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Encryption**: Patient data encryption at rest
4. **HTTPS**: Enforce SSL/TLS
5. **Rate Limiting**: Prevent abuse
6. **SQL Injection**: Already protected by MongoDB
7. **XSS Protection**: React's built-in escaping

## Performance Optimization

### Frontend

1. **Code Splitting**: React lazy loading for routes
2. **Asset Optimization**: Vite minification
3. **Image Optimization**: WebP format, lazy loading
4. **Caching**: Service Worker caches static assets
5. **Bundle Size**: Tree shaking unused code

### Backend

1. **Database Indexes**: Fast queries
2. **Compression**: Gzip middleware
3. **Caching**: In-memory cache for frequent queries
4. **Async Operations**: Non-blocking I/O
5. **Connection Pooling**: MongoDB connection pool

## Scalability

### Current Scale

- **Users**: Designed for 100-1000 concurrent users
- **Data**: Handles millions of game scores and mood entries
- **Hosting**: Single server deployment

### Scaling Strategy (Future)

1. **Horizontal Scaling**: Load balancer + multiple servers
2. **Database Sharding**: Partition by patient ID
3. **Caching Layer**: Redis for session and query caching
4. **CDN**: Static asset delivery
5. **Microservices**: Split services (games, reminders, etc.)

## Testing Strategy

### Planned Testing Approach

1. **Unit Tests**: Jest for utility functions
2. **Component Tests**: React Testing Library
3. **Integration Tests**: API endpoint testing
4. **E2E Tests**: Playwright for user flows
5. **Performance Tests**: Lighthouse CI

## Deployment Architecture

### Development
```
Local Machine
├── Backend: http://localhost:5000
└── Frontend: http://localhost:5173
```

### Production (Planned)
```
Frontend: Vercel/Netlify (Static hosting)
    ↓
Backend: Heroku/Railway (Container platform)
    ↓
Database: MongoDB Atlas (Managed MongoDB)
```

## Monitoring & Logging

### Current

- **Console Logging**: Development debugging
- **Morgan**: HTTP request logging

### Planned

- **Error Tracking**: Sentry for error monitoring
- **Analytics**: Google Analytics for usage
- **APM**: Application performance monitoring
- **Health Checks**: /health endpoint for uptime monitoring

## Future Enhancements

1. **Real-time Features**: WebSockets for live caregiver monitoring
2. **Video Calls**: WebRTC integration
3. **AI Chatbot**: Natural language interaction
4. **Mobile Apps**: React Native for iOS/Android
5. **Email/SMS**: Twilio integration for notifications
6. **Advanced Analytics**: ML-powered insights

---

**Version**: 1.0.0  
**Last Updated**: August 30, 2026
