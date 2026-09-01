import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { usePatient } from '../../context/PatientContext.jsx';
import { useTranslation } from '../../context/LanguageContext.jsx';

export default function VoiceAssistantButton() {
  const { patient } = usePatient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSupported, isListening, isSpeaking, lastResponse, error, startListening } =
    useVoiceAssistant({
      patientId: patient?._id,
      voiceVolume: patient?.voiceVolume,
      language: patient?.language || 'English',
      onAction: ({ action, target }) => { if (action === 'navigate' && target) navigate(target); },
    });

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {lastResponse && (
        <div className="max-w-[280px] glass-strong rounded-2xl rounded-br-md px-5 py-3.5 text-sm text-white/70 animate-fade-up">
          {lastResponse}
        </div>
      )}
      {error && (
        <div className="max-w-[280px] glass-strong rounded-2xl px-5 py-3.5 text-sm text-red-400 animate-fade-in">
          {t('voice.couldNotHear')}
        </div>
      )}
      <button
        onClick={startListening}
        aria-label="Voice assistant"
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-400 ${
          isListening
            ? 'bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse scale-110 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
            : isSpeaking
            ? 'bg-gold-500/20 border border-gold-500/30 text-gold-400 shadow-glow-gold'
            : 'glass-strong text-white/60 hover:text-white hover:border-brand-500/30 hover:shadow-glow'
        }`}
      >
        {isListening ? '🎙️' : '🎤'}
      </button>
    </div>
  );
}


