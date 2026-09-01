import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { remindersApi } from '../services/api';
import { queueOrSend, cacheGet, cacheSet } from '../services/offlineSync';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';
import moodGreat from '../assets/moods/great.jpg';
import moodGood from '../assets/moods/good.jpg';
import moodOkay from '../assets/moods/okay.jpg';
import moodLow from '../assets/moods/low.jpg';
import moodBad from '../assets/moods/bad.jpg';
import iconAlarm from '../assets/icons/alarm.jpg';
import iconCaregiver from '../assets/icons/caregiver.svg';
import iconSettings from '../assets/icons/settings.svg';

const MOODS = [
  { key: 'great', image: moodGreat, color: '#10b981', label: 'GREAT' },
  { key: 'good',  image: moodGood,  color: '#3b82f6', label: 'GOOD'  },
  { key: 'okay',  image: moodOkay,  color: '#f59e0b', label: 'OKAY'  },
  { key: 'low',   image: moodLow,   color: '#f97316', label: 'LOW'   },
  { key: 'bad',   image: moodBad,   color: '#ef4444', label: 'NOT GOOD' },
];

export default function HomePage() {
  const { patient } = usePatient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadReminders = useCallback(async () => {
    if (!patient?._id) return;
    setLoadingReminders(true);
    try {
      const res = await remindersApi.getForPatient(patient._id, 'pending');
      setReminders(res.data);
      await cacheSet('reminders', res.data);
    } catch {
      const cached = await cacheGet('reminders');
      if (cached) setReminders(cached);
    } finally { setLoadingReminders(false); }
  }, [patient]);

  useEffect(() => { loadReminders(); }, [loadReminders]);

  const handleMoodSelect = async (moodKey) => {
    setSelectedMood(moodKey);
    setMoodSubmitted(true);
    await queueOrSend('POST', '/api/moods', { patientId: patient._id, mood: moodKey }, 'Mood');
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('home.greeting_morning');
    if (h < 17) return t('home.greeting_afternoon');
    return t('home.greeting_evening');
  })();

  const clockStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr  = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="home-page-modern">
      {/* Same animated background as signup page */}
      <Animated3DBackground />

      {/* Hero Banner */}
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-left">
            <p className="home-hero-date">{dateStr}</p>
            <h1 className="home-greeting">
              {greeting},&nbsp;
              <span className="home-greeting-name">{patient?.name?.split(' ')[0] || 'friend'}</span>
            </h1>
            <p className="home-subtitle">{t('home.overview')}</p>
          </div>
          <div className="home-hero-clock">
            <span className="home-clock-time">{clockStr}</span>
            <span className="home-clock-label">Local Time</span>
          </div>
        </div>
      </section>

      <div className="home-container">

        {/* Mood Check-in Card */}
        <div className="home-section">
          <div className="home-glass-card mood-card">
            <div className="card-header-modern">
              <div>
                <p className="home-card-eyebrow">Daily Check-In</p>
                <h2 className="home-card-title">HOW ARE YOU FEELING?</h2>
              </div>
              <span className="home-card-icon-pulse">💭</span>
            </div>

            {!moodSubmitted ? (
              <div className="mood-grid">
                {MOODS.map((mood) => (
                  <button
                    key={mood.key}
                    onClick={() => handleMoodSelect(mood.key)}
                    className="mood-button"
                    style={{ '--mood-color': mood.color }}
                  >
                    <img src={mood.image} alt={mood.label} className="mood-image" />
                    <span className="mood-label">{mood.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mood-submitted">
                <img 
                  src={MOODS.find(m => m.key === selectedMood)?.image} 
                  alt="Selected Mood" 
                  className="mood-submitted-image" 
                />
                <p className="mood-submitted-text">
                  {t('home.thank_mood', { mood: t(`home.${selectedMood === 'bad' ? 'not_good' : selectedMood}`).toLowerCase() })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="home-grid">
          {/* Play Games Card */}
          <div className="home-glass-card home-interactive-card" onClick={() => navigate('/games')}>
            <div className="card-image-wrapper games-bg">
              <div className="games-bg-orb" />
              <div className="card-icon-large">🎮</div>
            </div>
            <div className="card-content-modern">
              <p className="home-card-eyebrow" style={{ color: '#7c3aed' }}>Cognitive Training</p>
              <h3 className="home-card-title-large">{t('home.play_game')}</h3>
              <p className="home-card-desc">{t('home.play_game_desc')}</p>
              <div className="home-card-action">
                {t('home.open')} <span className="home-card-arrow">→</span>
              </div>
            </div>
          </div>

          {/* Reminders Card */}
          <div className="home-glass-card reminders-card">
            <div className="card-header-modern">
              <div>
                <p className="home-card-eyebrow">Today</p>
                <h3 className="home-card-title">{t('home.reminders').toUpperCase()}</h3>
              </div>
              <img src={iconAlarm} className="home-card-icon-pulse" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '50%' }} alt="Alarm" />
            </div>

            <div className="reminders-content">
              {loadingReminders && (
                <div className="loading-skeleton">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton-item" />)}
                </div>
              )}
              {!loadingReminders && reminders.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">✅</span>
                  <p className="empty-text">{t('home.no_reminders')}</p>
                </div>
              )}
              {!loadingReminders && reminders.length > 0 && (
                <ul className="reminders-list">
                  {reminders.slice(0, 3).map((r) => (
                    <li key={r._id} className="reminder-item">
                      <div className="reminder-dot" />
                      <div className="reminder-content">
                        <span className="reminder-title">{r.title}</span>
                        <span className="reminder-time">{r.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={() => navigate('/reminders')} className="home-footer-link">
              {t('home.view_all')} →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="home-quick-card" onClick={() => navigate('/caregiver')}>
            <div className="home-qa-icon qa-green">
              <img src={iconCaregiver} alt="Caregiver" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>
            <div className="quick-action-content">
              <h4 className="home-qa-title">Caregiver Dashboard</h4>
              <p className="home-qa-desc">View progress and insights</p>
            </div>
            <span className="home-qa-arrow">→</span>
          </button>

          <button className="home-quick-card" onClick={() => navigate('/settings')}>
            <div className="home-qa-icon qa-blue">
              <img src={iconSettings} alt="Settings" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>
            <div className="quick-action-content">
              <h4 className="home-qa-title">Settings</h4>
              <p className="home-qa-desc">Customize your experience</p>
            </div>
            <span className="home-qa-arrow">→</span>
          </button>
        </div>

      </div>
    </div>
  );
}
