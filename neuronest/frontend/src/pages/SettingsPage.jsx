import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { queueOrSend } from '../services/offlineSync';
import { caregiversApi } from '../services/api';
import { decayDetector } from '../services/linguisticDecay';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const LANGUAGES = ['English', 'Assamese', 'Bengali', 'Hindi', 'Khasi', 'Mizo', 'Nagamese', 'Manipuri', 'Nepali'];
const FONT_SIZES = [
  { key: 'normal', labelKey: 'settings.normal' }, 
  { key: 'large', labelKey: 'settings.large' }, 
  { key: 'extra-large', labelKey: 'settings.extra_large' }
];

export default function SettingsPage() {
  const { patient, updateLocalPatient } = usePatient();
  const { t, decayLevel, isAutoTranslated, decayStatus } = useTranslation();
  const [saved, setSaved] = useState(false);
  const [caregiverForm, setCaregiverForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    relationToPatient: 'Family Member' 
  });
  const [linking, setLinking] = useState(false);
  const [caregiverLinked, setCaregiverLinked] = useState(!!patient?.caregiverId);

  const handleChange = async (field, value) => {
    updateLocalPatient({ [field]: value });
    setSaved(false);
    const res = await queueOrSend('PUT', `/api/patients/${patient._id}`, { [field]: value }, `Update ${field}`);
    if (res.ok) { 
      setSaved(true); 
      setTimeout(() => setSaved(false), 2000); 
    }
  };

  const handleCreateCaregiver = async (e) => {
    e.preventDefault();
    if (!caregiverForm.name.trim()) return;
    setLinking(true);
    try {
      const res = await caregiversApi.create({ ...caregiverForm, linkedPatientId: patient._id });
      updateLocalPatient({ caregiverId: res.data._id });
      setCaregiverLinked(true);
    } catch { 
      alert(t('settings.link')); 
    }
    finally { 
      setLinking(false); 
    }
  };

  return (
    <div className="modern-page" style={{ position: 'relative', background: 'transparent', minHeight: '100vh' }}>
      <Animated3DBackground />

      <div className="page-container" style={{ paddingTop: '40px', position: 'relative', zIndex: 1 }}>
        {/* Floating Hero Banner */}
        <div className="page-hero-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', marginBottom: '32px', textAlign: 'center' }}>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a2e1a' }}>{t('settings.title')}</h1>
          <p className="text-base font-medium" style={{ color: '#4a5a4a' }}>Customize your experience and preferences</p>
        </div>
        <div className="settings-grid">
          {/* Language Settings */}
          <div className="glass-card-modern">
            <div className="card-header-modern">
              <h2 style={{ color: '#2d5016', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em', margin: '0' }}>{t('settings.language').toUpperCase()}</h2>
              <span className="card-icon">🌐</span>
            </div>
            <div className="language-grid">
              {LANGUAGES.map((lang) => (
                <button 
                  key={lang} 
                  onClick={() => handleChange('language', lang)}
                  className={`language-btn ${patient?.language === lang ? 'active' : ''}`}
                  style={{ color: '#1a1a1a' }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size Settings */}
          <div className="glass-card-modern">
            <div className="card-header-modern">
              <h2 style={{ color: '#2d5016', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em', margin: '0' }}>{t('settings.text_size').toUpperCase()}</h2>
              <span className="card-icon">🔤</span>
            </div>
            <div className="font-size-buttons">
              {FONT_SIZES.map((s) => (
                <button 
                  key={s.key} 
                  onClick={() => handleChange('fontSizePreference', s.key)}
                  className={`font-size-btn ${patient?.fontSizePreference === s.key ? 'active' : ''}`}
                  style={{ color: '#1a1a1a' }}
                >
                  {t(s.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Volume Settings */}
          <div className="glass-card-modern">
            <div className="card-header-modern">
              <h2 style={{ color: '#2d5016', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em', margin: '0' }}>{t('settings.voice_volume').toUpperCase()}</h2>
              <span className="card-icon" style={{ fontSize: '1.2rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9V15H7L12 20V4L7 9H3Z" fill="#3d7a3d" />
                  <path d="M14 9.5C14.5 10 14.5 11 14.5 12C14.5 13 14.5 14 14 14.5" stroke="#3d7a3d" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16.5 7.5C17.5 8.5 18 10 18 12C18 14 17.5 15.5 16.5 16.5" stroke="#3d7a3d" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </div>
            <div className="volume-control">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={patient?.voiceVolume ?? 70}
                onChange={(e) => handleChange('voiceVolume', parseInt(e.target.value, 10))}
                className="volume-slider"
                style={{
                  background: `linear-gradient(to right, #3d7a3d 0%, #3d7a3d ${patient?.voiceVolume ?? 70}%, #e0e0e0 ${patient?.voiceVolume ?? 70}%, #e0e0e0 100%)`
                }}
              />
              <div className="volume-display" style={{ color: '#2d5016', fontWeight: '700', fontSize: '1.2rem' }}>{patient?.voiceVolume ?? 70}%</div>
            </div>
          </div>

          {/* Dynamic UI Translation - Decay Detection */}
          <div className="glass-card-modern">
            <div className="card-header-modern">
              <h2 style={{ color: '#2d5016', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em', margin: '0' }}>DYNAMIC TRANSLATION</h2>
              <span className="card-icon">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M3 5H15M7 3V5M5 5C5 8.5 8 12 12 15" stroke="#3d7a3d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 5C13 8 11 11 8 14" stroke="#3d7a3d" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                  <path d="M17 13L19 11L21 13M19 11V17" stroke="#3d7a3d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            <div style={{ padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Status</span>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: decayLevel === 0 ? 'rgba(61,122,61,0.1)' : decayLevel === 1 ? 'rgba(245,158,11,0.1)' : decayLevel === 2 ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)',
                  color: decayLevel === 0 ? '#3d7a3d' : decayLevel === 1 ? '#d97706' : decayLevel === 2 ? '#ea580c' : '#dc2626',
                }}>
                  {decayStatus?.label || 'Normal'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Interactions Tracked</span>
                <span style={{ color: '#1a2e1a', fontWeight: '700', fontSize: '14px' }}>{decayStatus?.interactionCount || 0}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#555', fontSize: '14px' }}>Auto-Simplified UI</span>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: isAutoTranslated ? 'rgba(61,122,61,0.1)' : 'rgba(150,150,150,0.1)',
                  color: isAutoTranslated ? '#3d7a3d' : '#999',
                }}>
                  {isAutoTranslated ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(122,170,122,0.05)', marginTop: '8px' }}>
                <p style={{ color: '#666', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                  {decayLevel === 0
                    ? 'The AI monitors your voice interactions for linguistic patterns. If it detects word-finding difficulty or shorter sentences, it will automatically simplify the interface and voice responses to reduce frustration.'
                    : `The AI has detected changes in your speech patterns and switched to simpler language mode. The interface and voice assistant are now using simplified text in ${patient?.language || 'English'}.`
                  }
                </p>
              </div>
              {decayLevel > 0 && (
                <button
                  onClick={() => { decayDetector.reset(); setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(122,170,122,0.3)',
                    background: 'rgba(122,170,122,0.08)', color: '#3d7a3d', fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', marginTop: '12px', transition: 'all 0.2s',
                  }}
                >
                  Reset to Normal Mode
                </button>
              )}
            </div>
          </div>

          {/* Caregiver Link */}
          {!caregiverLinked && (
            <div className="glass-card-modern caregiver-form-card">
              <div className="card-header-modern">
                <h2 style={{ color: '#2d5016', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em', margin: '0' }}>{t('settings.link_caregiver').toUpperCase()}</h2>
                <span className="card-icon">👥</span>
              </div>
              <form onSubmit={handleCreateCaregiver} className="caregiver-form">
                <input 
                  type="text" 
                  placeholder={t('settings.name')} 
                  required 
                  value={caregiverForm.name} 
                  onChange={(e) => setCaregiverForm((f) => ({ ...f, name: e.target.value }))} 
                  className="modern-input" 
                  style={{ color: '#1a1a1a' }}
                />
                <input 
                  type="email" 
                  placeholder={t('settings.email')} 
                  value={caregiverForm.email} 
                  onChange={(e) => setCaregiverForm((f) => ({ ...f, email: e.target.value }))} 
                  className="modern-input" 
                  style={{ color: '#1a1a1a' }}
                />
                <input 
                  type="tel" 
                  placeholder={t('settings.phone')} 
                  value={caregiverForm.phone} 
                  onChange={(e) => setCaregiverForm((f) => ({ ...f, phone: e.target.value }))} 
                  className="modern-input" 
                  style={{ color: '#1a1a1a' }}
                />
                <button type="submit" disabled={linking} className="submit-btn-modern" style={{ color: '#ffffff' }}>
                  {linking ? t('settings.linking') : t('settings.link')}
                </button>
              </form>
            </div>
          )}
        </div>

        {saved && (
          <div className="save-notification">
            ✓ {t('settings.saved')}
          </div>
        )}
      </div>
    </div>
  );
}


