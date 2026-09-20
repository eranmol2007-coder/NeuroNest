import React, { useState, useEffect } from 'react';
import { usePatient } from '../context/PatientContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { queueOrSend } from '../services/offlineSync';
import { caregiversApi } from '../services/api';
import { decayDetector } from '../services/linguisticDecay';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const LANGUAGES = ['English', 'Assamese', 'Bengali', 'Hindi', 'Khasi', 'Mizo', 'Nagamese', 'Manipuri', 'Arunachali'];
const FONT_SIZES = [
  { key: 'normal', labelKey: 'settings.normal' }, 
  { key: 'large', labelKey: 'settings.large' }, 
  { key: 'extra-large', labelKey: 'settings.extra_large' }
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { patient, updateLocalPatient, loadPatient } = usePatient();
  const { t, decayLevel, isAutoTranslated, decayStatus } = useTranslation();
  const [saved, setSaved] = useState(false);
  const [caregiverForm, setCaregiverForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    relationToPatient: '' 
  });
  const [linking, setLinking] = useState(false);
  const [caregiverLinked, setCaregiverLinked] = useState(!!patient?.caregiverId);
  const [showReplace, setShowReplace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [replaceMode, setReplaceMode] = useState(null);
  const [currentCaregiver, setCurrentCaregiver] = useState(null);
  const [caregiverLoadFailed, setCaregiverLoadFailed] = useState(false);
  const [fetchingCaregiver, setFetchingCaregiver] = useState(false);

  const fetchCurrentCaregiver = async (caregiverId) => {
    if (!caregiverId) return;
    setFetchingCaregiver(true);
    setCaregiverLoadFailed(false);
    try {
      const res = await caregiversApi.getById(caregiverId);
      const data = res?.data || res;
      if (data && (data._id || data.name)) {
        setCurrentCaregiver(data);
        setCaregiverLoadFailed(false);
      } else {
        // Empty response — caregiver genuinely doesn't exist, clear the stale link
        setCaregiverLinked(false);
        setCurrentCaregiver(null);
        updateLocalPatient({ caregiverId: null });
      }
    } catch (err) {
      console.warn('Caregiver fetch failed:', err.message);
      if (err.status === 404) {
        // Caregiver was deleted — clear the stale link
        setCaregiverLinked(false);
        setCurrentCaregiver(null);
        updateLocalPatient({ caregiverId: null });
      } else {
        // Network/transient error — keep the link, just show a retry state
        setCaregiverLoadFailed(true);
      }
    } finally {
      setFetchingCaregiver(false);
    }
  };

  // Keep caregiverLinked in sync whenever the patient object changes
  useEffect(() => {
    if (patient?.caregiverId) {
      setCaregiverLinked(true);
      if (!currentCaregiver || currentCaregiver._id !== patient.caregiverId) {
        fetchCurrentCaregiver(patient.caregiverId);
      }
    } else if (patient && !patient.caregiverId) {
      setCaregiverLinked(false);
      setCurrentCaregiver(null);
      setCaregiverLoadFailed(false);
    }
  }, [patient?.caregiverId, patient?._id]);


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
      const newCaregiver = res.data || res;
      // Update local state immediately for responsiveness
      updateLocalPatient({ caregiverId: newCaregiver._id });
      setCurrentCaregiver(newCaregiver);
      setCaregiverLinked(true);
      setCaregiverForm({ name: '', email: '', phone: '', relationToPatient: '' });
      // Re-fetch patient from backend to ensure caregiverId is persisted
      if (patient._id) {
        await loadPatient(patient._id);
      }
    } catch {
      alert('Failed to link caregiver. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  const handleSearchCaregiver = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await caregiversApi.findByIdentifier(searchQuery.trim());
      if (res.data && res.data._id !== patient?.caregiverId) {
        setSearchResult(res.data);
      } else if (res.data && res.data._id === patient?.caregiverId) {
        setSearchResult({ message: 'This is already your linked caregiver' });
      } else {
        setSearchResult({ message: 'No caregiver found with this email or phone' });
      }
    } catch {
      setSearchResult({ message: 'No caregiver found with this email or phone' });
    } finally {
      setSearching(false);
    }
  };

  const handleUnlinkCaregiver = async () => {
    if (!patient?.caregiverId) return;
    if (!window.confirm('Are you sure you want to remove your current caregiver?')) return;
    setLinking(true);
    try {
      await caregiversApi.unlinkPatient(patient.caregiverId);
      updateLocalPatient({ caregiverId: null });
      setCaregiverLinked(false);
      setCurrentCaregiver(null);
      setShowReplace(false);
      setReplaceMode(null);
      // Re-fetch patient from backend to confirm unlink persisted
      if (patient._id) {
        await loadPatient(patient._id);
      }
    } catch {
      alert('Failed to remove caregiver');
    } finally {
      setLinking(false);
    }
  };

  const handleLinkExistingCaregiver = async () => {
    if (!searchResult?._id || !patient?._id) return;
    setLinking(true);
    try {
      await caregiversApi.linkPatient(searchResult._id, patient._id);
      updateLocalPatient({ caregiverId: searchResult._id });
      setCurrentCaregiver(searchResult);
      setCaregiverLinked(true);
      setShowReplace(false);
      setReplaceMode(null);
      setSearchResult(null);
      setSearchQuery('');
      fetchCurrentCaregiver(searchResult._id);
      // Re-fetch patient from backend to ensure caregiverId is persisted
      if (patient._id) {
        await loadPatient(patient._id);
      }
    } catch {
      alert('Failed to link caregiver');
    } finally {
      setLinking(false);
    }
  };

  const handleCreateAndLinkCaregiver = async (e) => {
    e.preventDefault();
    if (!caregiverForm.name.trim()) return;
    setLinking(true);
    try {
      if (patient?.caregiverId) {
        await caregiversApi.unlinkPatient(patient.caregiverId);
      }
      const res = await caregiversApi.create({ ...caregiverForm, linkedPatientId: patient._id });
      const newCaregiver = res.data || res;
      updateLocalPatient({ caregiverId: newCaregiver._id });
      setCurrentCaregiver(newCaregiver);
      setCaregiverLinked(true);
      setShowReplace(false);
      setReplaceMode(null);
      setCaregiverForm({ name: '', email: '', phone: '', relationToPatient: '' });
      fetchCurrentCaregiver(newCaregiver._id);
      // Re-fetch patient from backend to ensure caregiverId is persisted
      if (patient._id) {
        await loadPatient(patient._id);
      }
    } catch {
      alert('Failed to create and link caregiver');
    } finally {
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
          {user?.role !== 'caregiver' && caregiverLinked && !showReplace && (
            <div className="glass-card-modern caregiver-form-card">
              <div className="card-header-modern">
                <h2 style={{ color: '#2d5016', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em', margin: '0' }}>CAREGIVER LINKED</h2>
                <span className="card-icon">👥</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                {currentCaregiver ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ color: '#555', fontSize: '14px' }}>Name</span>
                      <span style={{ color: '#1a2e1a', fontWeight: '700', fontSize: '14px' }}>{currentCaregiver.name}</span>
                    </div>
                    {currentCaregiver.email && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#555', fontSize: '14px' }}>Email</span>
                        <span style={{ color: '#1a2e1a', fontWeight: '600', fontSize: '14px' }}>{currentCaregiver.email}</span>
                      </div>
                    )}
                    {currentCaregiver.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ color: '#555', fontSize: '14px' }}>Phone</span>
                        <span style={{ color: '#1a2e1a', fontWeight: '600', fontSize: '14px' }}>{currentCaregiver.phone}</span>
                      </div>
                    )}
                    {currentCaregiver.relationToPatient && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#555', fontSize: '14px' }}>Relation</span>
                        <span style={{ color: '#1a2e1a', fontWeight: '600', fontSize: '14px' }}>{currentCaregiver.relationToPatient}</span>
                      </div>
                    )}
                  </>
                ) : fetchingCaregiver ? (
                  <div style={{ textAlign: 'center', padding: '12px', color: '#999', fontSize: '14px', marginBottom: '12px' }}>
                    Loading caregiver info...
                  </div>
                ) : caregiverLoadFailed ? (
                  <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#92400e', fontSize: '13px' }}>Could not load caregiver details</span>
                    <button
                      onClick={() => fetchCurrentCaregiver(patient?.caregiverId)}
                      style={{ background: 'none', border: 'none', color: '#3d7a3d', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '2px 6px' }}
                    >
                      Retry
                    </button>
                  </div>
                ) : null}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => { setShowReplace(true); setReplaceMode('search'); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(61,122,61,0.3)', background: 'rgba(61,122,61,0.08)', color: '#3d7a3d', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Replace Caregiver
                  </button>
                  <button
                    onClick={handleUnlinkCaregiver}
                    disabled={linking}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#dc2626', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {linking ? 'Removing...' : 'Remove Caregiver'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {user?.role !== 'caregiver' && caregiverLinked && showReplace && (
            <div className="glass-card-modern caregiver-form-card">
              <div className="card-header-modern">
                <h2 style={{ color: '#2d5016', fontWeight: '700', fontSize: '0.875rem', letterSpacing: '0.05em', margin: '0' }}>REPLACE CAREGIVER</h2>
                <span className="card-icon">🔄</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    onClick={() => { setReplaceMode('search'); setSearchResult(null); setSearchQuery(''); }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: replaceMode === 'search' ? '2px solid #3d7a3d' : '1px solid #e0ede0', background: replaceMode === 'search' ? 'rgba(61,122,61,0.1)' : '#fff', color: replaceMode === 'search' ? '#3d7a3d' : '#666', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Find Existing
                  </button>
                  <button
                    onClick={() => { setReplaceMode('create'); setSearchResult(null); }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: replaceMode === 'create' ? '2px solid #3d7a3d' : '1px solid #e0ede0', background: replaceMode === 'create' ? 'rgba(61,122,61,0.1)' : '#fff', color: replaceMode === 'create' ? '#3d7a3d' : '#666', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Create New
                  </button>
                </div>

                {replaceMode === 'search' && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        placeholder="Email or phone number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchCaregiver()}
                        className="modern-input"
                        style={{ flex: 1, color: '#1a1a1a' }}
                      />
                      <button
                        onClick={handleSearchCaregiver}
                        disabled={searching || !searchQuery.trim()}
                        style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#3d7a3d', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        {searching ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                    {searchResult && (
                      <div style={{ padding: '12px', borderRadius: '10px', background: searchResult._id ? 'rgba(61,122,61,0.06)' : 'rgba(239,68,68,0.06)', border: searchResult._id ? '1px solid rgba(61,122,61,0.2)' : '1px solid rgba(239,68,68,0.2)', marginBottom: '12px' }}>
                        {searchResult._id ? (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '700', color: '#1a2e1a', fontSize: '14px' }}>{searchResult.name}</span>
                              <span style={{ padding: '2px 8px', borderRadius: '12px', background: 'rgba(61,122,61,0.1)', color: '#3d7a3d', fontSize: '11px', fontWeight: '600' }}>Found</span>
                            </div>
                            {searchResult.email && <div style={{ color: '#666', fontSize: '13px', marginBottom: '2px' }}>{searchResult.email}</div>}
                            {searchResult.phone && <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>{searchResult.phone}</div>}
                            <button
                              onClick={handleLinkExistingCaregiver}
                              disabled={linking}
                              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: '#3d7a3d', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              {linking ? 'Linking...' : 'Link This Caregiver'}
                            </button>
                          </>
                        ) : (
                          <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{searchResult.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {replaceMode === 'create' && (
                  <form onSubmit={handleCreateAndLinkCaregiver}>
                    <input
                      type="text"
                      placeholder={t('settings.name')}
                      required
                      value={caregiverForm.name}
                      onChange={(e) => setCaregiverForm((f) => ({ ...f, name: e.target.value }))}
                      className="modern-input"
                      style={{ color: '#1a1a1a', marginBottom: '8px' }}
                    />
                    <input
                      type="email"
                      placeholder={t('settings.email')}
                      value={caregiverForm.email}
                      onChange={(e) => setCaregiverForm((f) => ({ ...f, email: e.target.value }))}
                      className="modern-input"
                      style={{ color: '#1a1a1a', marginBottom: '8px' }}
                    />
                    <input
                      type="tel"
                      placeholder={t('settings.phone')}
                      value={caregiverForm.phone}
                      onChange={(e) => setCaregiverForm((f) => ({ ...f, phone: e.target.value }))}
                      className="modern-input"
                      style={{ color: '#1a1a1a', marginBottom: '8px' }}
                    />
                    <select
                      value={caregiverForm.relationToPatient}
                      onChange={(e) => setCaregiverForm((f) => ({ ...f, relationToPatient: e.target.value }))}
                      className="modern-input"
                      style={{ color: '#1a1a1a', marginBottom: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #e0ede0', background: '#fff', width: '100%', fontSize: '14px' }}
                    >
                      <option value="" disabled>Select Relationship</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Family Member">Family Member</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Professional Caregiver">Professional Caregiver</option>
                      <option value="Other">Other</option>
                    </select>
                    <button type="submit" disabled={linking} className="submit-btn-modern" style={{ color: '#ffffff' }}>
                      {linking ? 'Creating & Linking...' : 'Create & Link Caregiver'}
                    </button>
                  </form>
                )}

                <button
                  onClick={() => { setShowReplace(false); setReplaceMode(null); setSearchResult(null); setSearchQuery(''); }}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #e0ede0', background: '#f8f8fc', color: '#666', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '12px', transition: 'all 0.2s' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {user?.role !== 'caregiver' && !caregiverLinked && !showReplace && (
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
                <select
                  value={caregiverForm.relationToPatient}
                  onChange={(e) => setCaregiverForm((f) => ({ ...f, relationToPatient: e.target.value }))}
                  className="modern-input"
                  style={{ color: '#1a1a1a', padding: '12px', borderRadius: '10px', border: '1px solid #e0ede0', background: '#fff', width: '100%', fontSize: '14px' }}
                >
                  <option value="" disabled>Select Relationship</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Professional Caregiver">Professional Caregiver</option>
                  <option value="Other">Other</option>
                </select>
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


