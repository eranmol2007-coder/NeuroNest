import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePatient } from './context/PatientContext.jsx';
import Animated3DBackground from './components/ui/Animated3DBackground.jsx';
import NavBar from './components/layout/NavBar.jsx';
import OfflineBanner from './components/features/OfflineBanner.jsx';
import VoiceAssistantButton from './components/features/VoiceAssistantButton.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import HomePage from './pages/HomePage.jsx';
import GamesPage from './pages/GamesPage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import CaregiverPage from './pages/CaregiverPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import MemoryMatchGame from './games/MemoryMatchGame.jsx';
import PatternRecognitionGame from './games/PatternRecognitionGame.jsx';
import DailyRoutineRecallGame from './games/DailyRoutineRecallGame.jsx';

function RequirePatient({ children }) {
  const { patient, loading } = usePatient();
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
  if (!patient) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen relative">
      <Animated3DBackground />
      <div className="relative z-10">
        <OfflineBanner />
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/home" element={<RequirePatient><HomePage /></RequirePatient>} />
            <Route path="/games" element={<RequirePatient><GamesPage /></RequirePatient>} />
            <Route path="/games/memory-match" element={<RequirePatient><MemoryMatchGame /></RequirePatient>} />
            <Route path="/games/pattern-recognition" element={<RequirePatient><PatternRecognitionGame /></RequirePatient>} />
            <Route path="/games/daily-routine-recall" element={<RequirePatient><DailyRoutineRecallGame /></RequirePatient>} />
            <Route path="/reminders" element={<RequirePatient><RemindersPage /></RequirePatient>} />
            <Route path="/caregiver" element={<RequirePatient><CaregiverPage /></RequirePatient>} />
            <Route path="/settings" element={<RequirePatient><SettingsPage /></RequirePatient>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <VoiceAssistantButton />
      </div>
    </div>
  );
}


