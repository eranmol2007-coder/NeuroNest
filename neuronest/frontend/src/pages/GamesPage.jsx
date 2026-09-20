import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const GAMES = [
  { 
    key: 'memory-match', 
    path: '/games/memory-match', 
    icon: '🃏', 
    titleKey: 'games.memory_match', 
    descKey: 'games.memory_match_desc',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#667eea'
  },
  { 
    key: 'pattern-recognition', 
    path: '/games/pattern-recognition', 
    icon: '🏮', 
    titleKey: 'games.pattern_recognition', 
    descKey: 'games.pattern_recognition_desc',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f093fb'
  },
  { 
    key: 'daily-routine-recall', 
    path: '/games/daily-routine-recall', 
    icon: '📋', 
    titleKey: 'games.daily_routine', 
    descKey: 'games.daily_routine_desc',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe'
  },
];

export default function GamesPage() {
  const navigate = useNavigate();
  const { patient } = usePatient();
  const { t } = useTranslation();

  return (
    <div className="modern-page" style={{ position: 'relative', background: 'transparent' }}>
      <Animated3DBackground />
      {/* Hero Section */}
      <section className="page-hero" style={{ zIndex: 2 }}>
        <div className="page-hero-bg games-hero-bg" style={{ display: 'none' }}></div>
        <div className="page-hero-content">
          <h1 className="page-title">{t('games.title')}</h1>
          <p className="page-subtitle">
            {t('games.difficulty')}{' '}
            <span className="difficulty-badge">{patient?.currentDifficulty || 'easy'}</span>
            {' '}{t('games.auto_adjusts')}
          </p>
        </div>
      </section>

      <div className="page-container">
        {/* Games Grid */}
        <div className="games-grid">
          {GAMES.map((game, i) => (
            <button 
              key={game.key} 
              onClick={() => navigate(game.path)}
              className="game-card"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                '--game-gradient': game.gradient,
                '--game-color': game.color
              }}
            >
              <div className="game-card-header" style={{ background: game.gradient }}>
                <div className="game-icon">{game.icon}</div>
              </div>
              <div className="game-card-body">
                <h3 className="game-title">{t(game.titleKey)}</h3>
                <p className="game-description">{t(game.descKey)}</p>
                <div className="game-play-btn">
                  <span>{t('games.play')}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-icon">🧠</div>
            <div className="info-content">
              <h3 className="info-title">Adaptive Difficulty</h3>
              <p className="info-text">
                Our AI-powered system automatically adjusts game difficulty based on your performance, 
                ensuring an optimal challenge level that promotes cognitive growth without frustration.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📊</div>
            <div className="info-content">
              <h3 className="info-title">Progress Tracking</h3>
              <p className="info-text">
                All your scores and achievements are tracked over time, allowing you and your caregivers 
                to monitor cognitive improvement and engagement patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


