# NeuroNest 🧠

> AI-Powered Cognitive Gaming and Memory Assistance Platform for Dementia Care

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/neuronest)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

NeuroNest is a comprehensive web application designed to support individuals with dementia and their caregivers through cognitive games, mood tracking, medication reminders, and real-time monitoring.

## 📑 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### For Patients
- **Cognitive Games**: Three scientifically-designed memory games with adaptive difficulty
  - Memory Match Game
  - Pattern Recognition Game
  - Daily Routine Recall Game
- **Mood Tracking**: Daily emotional check-ins with visual mood journaling
- **Medication Reminders**: Customizable reminders with recurring schedules
- **Voice Assistant**: Hands-free voice commands for accessibility
- **Multilingual Support**: 7 languages including English, Hindi, Bengali, Assamese, and more
- **Offline Capability**: Progressive Web App (PWA) with offline sync

### For Caregivers
- **Real-time Dashboard**: Monitor patient cognitive performance and mood trends
- **Alert System**: Automated alerts for missed reminders and concerning patterns
- **Performance Analytics**: Visual charts tracking accuracy, mood, and game performance
- **Patient Management**: Link and monitor multiple patients

### Technical Highlights
- **Adaptive Difficulty Engine**: AI-powered game difficulty adjustment based on performance
- **3D Animations**: Modern glass morphism design with particle effects
- **Accessibility**: WCAG-compliant with high contrast and large font options
- **Mobile-First**: Responsive design optimized for tablets and smartphones

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Routing**: React Router DOM 6.26
- **Styling**: Tailwind CSS 3.4.9 + Custom CSS with Glass Morphism
- **Charts**: Chart.js 4.4.3 + React Chart.js 2
- **Build Tool**: Vite 5.4
- **PWA**: Vite Plugin PWA with Workbox
- **Storage**: IndexedDB (idb 8.0.0)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.19.2
- **Database**: MongoDB with Mongoose 8.5.0
- **Security**: Helmet 7.1.0, CORS 2.8.5
- **Performance**: Compression 1.7.4
- **Logging**: Morgan 1.10.0

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 6.0 (local or Atlas)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neuronest.git
   cd neuronest
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and settings
   ```

4. **Seed the database (optional)**
   ```bash
   cd backend
   npm run seed
   ```

5. **Start development servers**

   **Option A: Using batch files (Windows)**
   ```bash
   # From project root
   START_NEURONEST.bat
   ```

   **Option B: Manual start**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Default Test Accounts

```
Patient Account:
- Name: John Doe
- Difficulty: Medium

Caregiver Account:
- Name: Jane Smith
- Email: jane@example.com
```

## 📁 Project Structure

```
neuronest/
├── backend/                    # Node.js + Express API
│   ├── config/                # Database and app configuration
│   │   └── db.js             # MongoDB connection
│   ├── controllers/           # Route controllers (business logic)
│   │   ├── alertController.js
│   │   ├── caregiverController.js
│   │   ├── gameScoreController.js
│   │   ├── moodController.js
│   │   ├── patientController.js
│   │   ├── reminderController.js
│   │   └── voiceController.js
│   ├── middleware/            # Express middleware
│   │   └── errorHandler.js   # Global error handling
│   ├── models/                # Mongoose schemas
│   │   ├── Alert.js
│   │   ├── Caregiver.js
│   │   ├── GameScore.js
│   │   ├── MoodCheckin.js
│   │   ├── Patient.js
│   │   └── Reminder.js
│   ├── routes/                # API route definitions
│   │   ├── alertRoutes.js
│   │   ├── caregiverRoutes.js
│   │   ├── moodRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── reminderRoutes.js
│   │   ├── scoreRoutes.js
│   │   └── voiceRoutes.js
│   ├── utils/                 # Utility functions
│   │   ├── adaptiveDifficulty.js  # AI difficulty adjustment
│   │   ├── alertEngine.js         # Alert generation logic
│   │   ├── memoryDb.js            # In-memory cache
│   │   ├── modelResolver.js       # Dynamic model loading
│   │   └── seed.js                # Database seeding
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express app entry point
│
├── frontend/                  # React + Vite SPA
│   ├── public/               # Static assets
│   │   ├── favicon.svg
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── AnimatedBackground.jsx  # 3D particle system
│   │   │   ├── Animated3DBackground.jsx
│   │   │   ├── BigButton.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── NavBar.jsx            # Floating navigation
│   │   │   ├── OfflineBanner.jsx
│   │   │   └── VoiceAssistantButton.jsx
│   │   ├── context/          # React Context providers
│   │   │   ├── LanguageContext.jsx   # i18n state
│   │   │   └── PatientContext.jsx    # Patient state
│   │   ├── games/            # Cognitive game components
│   │   │   ├── DailyRoutineRecallGame.jsx
│   │   │   ├── MemoryMatchGame.jsx
│   │   │   └── PatternRecognitionGame.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useOfflineSync.js
│   │   │   └── useVoiceAssistant.js
│   │   ├── i18n/             # Translation files
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   ├── bn.json
│   │   │   ├── as.json
│   │   │   ├── kha.json
│   │   │   ├── mni.json
│   │   │   └── mzo.json
│   │   ├── pages/            # Route page components
│   │   │   ├── CaregiverPage.jsx
│   │   │   ├── GamesPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MoodPage.jsx
│   │   │   ├── ProfilesPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── RemindersPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── WelcomePage.jsx
│   │   ├── utils/            # Utility functions
│   │   │   ├── api.js        # API client
│   │   │   └── offlineSync.js # PWA sync logic
│   │   ├── App.jsx           # Main app component
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # React entry point
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   ├── postcss.config.js     # PostCSS configuration
│   ├── tailwind.config.js    # Tailwind CSS config
│   └── vite.config.js        # Vite bundler config
│
├── docs/                      # Additional documentation
│   ├── API.md                # API endpoint documentation
│   ├── ARCHITECTURE.md       # System architecture
│   └── CONTRIBUTING.md       # Contribution guidelines
│
├── .gitignore                # Git ignore rules
├── LICENSE                   # MIT License
└── README.md                 # This file
```

## 💻 Development

### Backend Development

```bash
cd backend

# Start development server with auto-reload
npm run dev

# Seed database with test data
npm run seed

# Production start
npm start
```

**Environment Variables** (`.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neuronest
NODE_ENV=development
```

### Frontend Development

```bash
cd frontend

# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality Tools

We recommend installing these tools for consistent code quality:

```bash
# ESLint for linting
npm install -D eslint eslint-plugin-react

# Prettier for formatting
npm install -D prettier

# Run linting
npm run lint

# Format code
npm run format
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently, the API uses patient/caregiver IDs for identification. Full JWT authentication is planned for v2.0.

### Key Endpoints

#### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

#### Game Scores
- `POST /api/scores` - Submit game score
- `GET /api/scores/patient/:patientId` - Get patient scores
- `GET /api/scores/analytics/:patientId` - Get performance analytics

#### Mood Tracking
- `POST /api/mood` - Submit mood check-in
- `GET /api/mood/patient/:patientId` - Get mood history
- `GET /api/mood/trend/:patientId` - Get mood trend data

#### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders/patient/:patientId` - Get patient reminders
- `PUT /api/reminders/:id/complete` - Mark reminder complete
- `DELETE /api/reminders/:id` - Delete reminder

#### Caregivers
- `POST /api/caregivers` - Create caregiver account
- `GET /api/caregivers/:id/dashboard` - Get caregiver dashboard with analytics

#### Alerts
- `GET /api/alerts/patient/:patientId` - Get patient alerts
- `PUT /api/alerts/:id/resolve` - Resolve alert

For detailed API documentation, see [docs/API.md](docs/API.md)

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service

3. Set environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

### Backend (Heroku/Railway/DigitalOcean)

1. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)

2. Set environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=production
   PORT=5000
   ```

3. Deploy using your preferred platform

### Docker (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ES6+ syntax
- Follow Airbnb JavaScript Style Guide
- Write descriptive commit messages
- Add JSDoc comments for functions
- Keep components small and focused

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Development Team** - Initial work

## 🙏 Acknowledgments

- Inspired by cognitive therapy research and dementia care best practices
- UI design influenced by Brendon Wright Psychology website
- Icons and animations from open-source libraries
- Community feedback from healthcare professionals

## 📞 Support

For questions, issues, or feedback:
- Open an issue on GitHub
- Email: support@neuronest.app
- Documentation: [docs/](docs/)

## 🗺 Roadmap

- [ ] JWT Authentication & Authorization
- [ ] Email/SMS Notifications
- [ ] Mobile Native Apps (React Native)
- [ ] Video Call Integration
- [ ] AI Chatbot Companion
- [ ] Advanced Analytics Dashboard
- [ ] Multi-tenant Support
- [ ] HIPAA Compliance Mode

---

**Built with ❤️ for dementia care and cognitive health**
