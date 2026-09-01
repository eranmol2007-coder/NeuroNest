import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { queueOrSend } from '../services/offlineSync';
import { caregiversApi } from '../services/api';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const LANGUAGES = ['English', 'Assamese', 'Bengali', 'Hindi', 'Khasi', 'Mizo', 'Nagamese', 'Manipuri', 'Nepali'];
const FONT_SIZES = [
  { key: 'normal', labelKey: 'settings.normal' }, 
  { key: 'large', labelKey: 'settings.large' }, 
  { key: 'extra-large', labelKey: 'settings.extra_large' }
];

export default function SettingsPage() {
  const { patient, updateLocalPatient } = usePatient();
  const { t } = useTranslation();
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
              <span className="card-icon">🔊</span>
            </div>
            <div className="volume-control">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={patient?.voiceVolume ?? 70}
                onChange={(e) => handleChange('voiceVolume', parseInt(e.target.value, 10))}
                className="volume-slider"
              />
              <div className="volume-display" style={{ color: '#2d5016', fontWeight: '700', fontSize: '1.5rem' }}>{patient?.voiceVolume ?? 70}%</div>
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


