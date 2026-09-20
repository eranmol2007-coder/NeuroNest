import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { usePatient } from './context/PatientContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Animated3DBackground from './components/ui/Animated3DBackground.jsx';
import NavBar from './components/layout/NavBar.jsx';
import OfflineBanner from './components/features/OfflineBanner.jsx';
import VoiceAssistantButton from './components/features/VoiceAssistantButton.jsx';
import GlobalAlarm from './components/features/GlobalAlarm.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import HomePage from './pages/HomePage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import CaregiverPage from './pages/CaregiverPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PatientReportPage from './pages/PatientReportPage.jsx';
import ReminiscencePage from './pages/ReminiscencePage.jsx';
import CaregiverStoriesPage from './pages/CaregiverStoriesPage.jsx';
import MemoryMatchGame from './games/MemoryMatchGame.jsx';
import PatternRecognitionGame from './games/PatternRecognitionGame.jsx';
import DailyRoutineRecallGame from './games/DailyRoutineRecallGame.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-brand-500/20 border-t-brand-400 rounded-full animate-spin-slow" />
          <p className="section-label">Loading</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

function RequirePatient({ children }) {
  const { patient, loading } = usePatient();
  const { user } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-brand-500/20 border-t-brand-400 rounded-full animate-spin-slow" />
          <p className="section-label">Loading</p>
        </div>
      </div>
    );
  }
  if (!patient) return <Navigate to={user?.role === 'caregiver' ? '/caregiver' : '/'} replace />;
  return children;
}

function RequireCaregiver({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-brand-500/20 border-t-brand-400 rounded-full animate-spin-slow" />
          <p className="section-label">Loading</p>
        </div>
      </div>
    );
  }
  if (!user || user.role !== 'caregiver') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const { user } = useAuth();
  const isCaregiver = user?.role === 'caregiver';
  const showVoiceAssistant = user && !isCaregiver;

  return (
    <div className="min-h-screen relative">
      <Animated3DBackground />
      <div className="relative z-10">
        <OfflineBanner />
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Patient routes */}
            <Route path="/home" element={<RequireAuth><RequirePatient><HomePage /></RequirePatient></RequireAuth>} />
            <Route path="/games" element={<RequireAuth><RequirePatient><GamesPage /></RequirePatient></RequireAuth>} />
            <Route path="/games/memory-match" element={<RequireAuth><RequirePatient><MemoryMatchGame /></RequirePatient></RequireAuth>} />
            <Route path="/games/pattern-recognition" element={<RequireAuth><RequirePatient><PatternRecognitionGame /></RequirePatient></RequireAuth>} />
            <Route path="/games/daily-routine-recall" element={<RequireAuth><RequirePatient><DailyRoutineRecallGame /></RequirePatient></RequireAuth>} />
            <Route path="/reminders" element={<RequireAuth><RequirePatient><RemindersPage /></RequirePatient></RequireAuth>} />
            <Route path="/patient-report" element={<RequireAuth><RequirePatient><PatientReportPage /></RequirePatient></RequireAuth>} />
            <Route path="/reminiscence" element={<RequireAuth><RequirePatient><ReminiscencePage /></RequirePatient></RequireAuth>} />

            {/* Caregiver routes */}
            <Route path="/caregiver" element={<RequireAuth><RequireCaregiver><CaregiverPage /></RequireCaregiver></RequireAuth>} />
            <Route path="/caregiver/stories" element={<RequireAuth><RequireCaregiver><CaregiverStoriesPage /></RequireCaregiver></RequireAuth>} />

            {/* Shared routes */}
            <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {showVoiceAssistant && <VoiceAssistantButton />}
        <GlobalAlarm />
      </div>
    </div>
  );
}
