import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../context/LanguageContext.jsx';

const NeuroNestLogo = () => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="url(#glass-gradient)" stroke="url(#border-gradient)" strokeWidth="1.5"/>
    <circle cx="20" cy="12" r="2.5" fill="#7a9a7a" opacity="0.9">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="14" cy="20" r="2.5" fill="#5a8a5a" opacity="0.8">
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="26" cy="20" r="2.5" fill="#5a8a5a" opacity="0.8">
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="20" cy="28" r="2.5" fill="#7a9a7a" opacity="0.9">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="20" cy="20" r="3" fill="#4a7a4a" opacity="1">
      <animate attributeName="r" values="3;3.5;3" dur="2s" repeatCount="indefinite"/>
    </circle>
    <line x1="20" y1="14" x2="20" y2="17" stroke="#7a9a7a" strokeWidth="1.5" opacity="0.6"/>
    <line x1="16.5" y1="18" x2="20" y2="20" stroke="#7a9a7a" strokeWidth="1.5" opacity="0.6"/>
    <line x1="23.5" y1="18" x2="20" y2="20" stroke="#7a9a7a" strokeWidth="1.5" opacity="0.6"/>
    <line x1="20" y1="23" x2="20" y2="26" stroke="#7a9a7a" strokeWidth="1.5" opacity="0.6"/>
    <defs>
      <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9"/>
        <stop offset="50%" stopColor="#d4e7d4" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#c5ddc5" stopOpacity="0.8"/>
      </linearGradient>
      <linearGradient id="border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7a9a7a" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#5a8a5a" stopOpacity="0.4"/>
      </linearGradient>
    </defs>
  </svg>
);

function IconSignIn({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M6 4 H3 C2.5 4 2 4.5 2 5 V13 C2 13.5 2.5 14 3 14 H6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 9 L7 9 M12 9 L10 7 M12 9 L10 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSignOut({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M12 4 H15 C15.5 4 16 4.5 16 5 V13 C16 13.5 15.5 14 15 14 H12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 9 L11 9 M6 9 L8 7 M6 9 L8 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NavBar() {
  const { patient, clearPatient } = usePatient();
  const { user, caregiver, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === '/' && !user;
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';
  const isCaregiver = !!caregiver;

  if (isAuthPage) return null;

  return (
    <header className="nav-glass">
      <div className="nav-inner">
        <button onClick={() => navigate(user ? (isCaregiver ? '/caregiver' : '/home') : '/')} className="nav-brand">
          <NeuroNestLogo />
          <div className="nav-brand-text">
            <span className="nav-brand-name">{t('app_name')}</span>
            <span className="nav-brand-tagline">{isCaregiver ? 'Caregiver Portal' : 'Cognitive Care Platform'}</span>
          </div>
        </button>

        {user ? (
          <nav className="nav-links" aria-label="Main navigation">
            <NavLink to="/home" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t('nav.home')}</NavLink>
            <NavLink to="/reminiscence" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Stories</NavLink>
            <NavLink to="/games" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t('nav.games')}</NavLink>
            <NavLink to="/reminders" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t('nav.reminders')}</NavLink>
            <NavLink to="/caregiver" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t('nav.caregiver')}</NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{t('nav.settings')}</NavLink>
            <div className="nav-divider" />
            <button onClick={() => { clearPatient(); logout(); navigate('/'); }} className="nav-link nav-signout" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconSignOut size={16} /> {t('nav.sign_out')}
            </button>
          </nav>
        ) : (
          <nav className="nav-links" aria-label="Main navigation">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="nav-link">Home</button>
            <button onClick={() => document.querySelector('.brendon-about')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link">About</button>
            <button onClick={() => document.querySelector('.brendon-services')?.scrollIntoView({ behavior: 'smooth' })} className="nav-link">Features</button>
            <div className="nav-divider" />
            <button onClick={() => navigate('/signin')} className="nav-link" style={{ color: '#2a5a2a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconSignIn size={16} /> Sign In
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
