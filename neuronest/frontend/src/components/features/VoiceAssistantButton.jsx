import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { usePatient } from '../../context/PatientContext.jsx';
import { useTranslation } from '../../context/LanguageContext.jsx';

function IconMic({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M5 10 C5 14.4 8.1 18 12 18 C15.9 18 19 14.4 19 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconWaveform({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="2" height="4" rx="1" fill="currentColor" opacity="0.5">
        <animate attributeName="height" values="4;10;4" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="10;7;10" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect x="7" y="8" width="2" height="8" rx="1" fill="currentColor" opacity="0.6">
        <animate attributeName="height" values="8;14;8" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" values="8;5;8" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="11" y="6" width="2" height="12" rx="1" fill="currentColor" opacity="0.8">
        <animate attributeName="height" values="12;18;12" dur="0.7s" repeatCount="indefinite" />
        <animate attributeName="y" values="6;3;6" dur="0.7s" repeatCount="indefinite" />
      </rect>
      <rect x="15" y="8" width="2" height="8" rx="1" fill="currentColor" opacity="0.6">
        <animate attributeName="height" values="8;14;8" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" values="8;5;8" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="19" y="10" width="2" height="4" rx="1" fill="currentColor" opacity="0.5">
        <animate attributeName="height" values="4;10;4" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="10;7;10" dur="0.8s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

function DecayIndicator({ level }) {
  if (level === 0) return null;
  const colors = ['', '#f59e0b', '#f97316', '#ef4444'];
  const labels = ['', 'Simple Mode', 'Simpler Mode', 'Simplest Mode'];
  return (
    <div style={{
      position: 'absolute', top: '-8px', right: '-8px',
      background: colors[level], color: '#fff',
      fontSize: '9px', fontWeight: '700', padding: '2px 6px',
      borderRadius: '8px', whiteSpace: 'nowrap',
      boxShadow: `0 2px 8px ${colors[level]}40`,
    }}>
      {labels[level]}
    </div>
  );
}

export default function VoiceAssistantButton() {
  const { patient } = usePatient();
  const { t, decayLevel } = useTranslation();
  const navigate = useNavigate();

  const effectivePatientId = patient?._id || localStorage.getItem('neuronest_active_patient_id');

  const { isSupported, isListening, isSpeaking, lastResponse, error, startListening, decayStatus } =
    useVoiceAssistant({
      patientId: effectivePatientId,
      voiceVolume: patient?.voiceVolume,
      language: patient?.language || 'English',
      onAction: ({ action, target }) => { if (action === 'navigate' && target) navigate(target); },
    });

  if (!isSupported) return null;

  const activeDecayLevel = decayStatus?.level || decayLevel || 0;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {lastResponse && (
        <div className="max-w-[280px] rounded-2xl rounded-br-md px-5 py-3.5 text-sm animate-fade-up" style={{
          background: 'rgba(42,90,42,0.92)', backdropFilter: 'blur(16px)',
          color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}>
          {lastResponse}
        </div>
      )}
      {error && (
        <div className="max-w-[280px] rounded-2xl px-5 py-3.5 text-sm animate-fade-in" style={{
          background: 'rgba(239,68,68,0.15)', backdropFilter: 'blur(16px)',
          color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)',
        }}>
          {t('voice.couldNotHear')}
        </div>
      )}
      <button
        onClick={startListening}
        aria-label="Voice assistant"
        style={{
          width: '56px', height: '56px', borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'all 0.3s ease',
          background: isListening
            ? 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.15))'
            : isSpeaking
            ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.15))'
            : 'linear-gradient(135deg, rgba(42,90,42,0.25), rgba(42,90,42,0.12))',
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${isListening ? 'rgba(239,68,68,0.4)' : isSpeaking ? 'rgba(245,158,11,0.4)' : 'rgba(122,170,122,0.35)'}`,
          color: isListening ? '#fca5a5' : isSpeaking ? '#fcd34d' : '#a3be8c',
          boxShadow: isListening
            ? '0 0 30px rgba(239,68,68,0.2)'
            : isSpeaking
            ? '0 0 30px rgba(245,158,11,0.15)'
            : '0 4px 20px rgba(0,0,0,0.1)',
          transform: isListening ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <DecayIndicator level={activeDecayLevel} />
        {isListening ? <IconWaveform size={24} /> : <IconMic size={24} />}
      </button>
    </div>
  );
}
