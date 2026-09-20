import React, { useState, useEffect, useRef } from 'react';
import { usePatient } from '../../context/PatientContext.jsx';
import { useNavigate } from 'react-router-dom';

function IconBell({ size = 48, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M18 20 C18 14 21 8 24 7 C27 8 30 14 30 20 V28 L36 34 H12 L18 28 V20Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={`${color}10`} />
      <path d="M21 34 C21 37 22.5 40 24 40 C25.5 40 27 37 27 34" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function IconClock({ size = 16, color = '#5a9a5a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.3" />
      <path d="M8 4.5 L8 8 L10.5 9.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDone({ size = 14, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7 L5.5 10 L11.5 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSnooze({ size = 20, color = '#4a5a4a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <path d="M6 10 C6 7.5 8 5 10 5 C12 5 14 7 14 10 C14 13 12 15 10 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M14 10 L16 12 L16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
};

const formatTime = (t24) => {
  if (!t24) return '';
  const [h, m] = t24.split(':');
  const hr = parseInt(h); const p = hr >= 12 ? 'PM' : 'AM';
  const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${h12}:${m} ${p}`;
};

export default function GlobalAlarm() {
  const { patient } = usePatient();
  const navigate = useNavigate();
  const [alarmReminder, setAlarmReminder] = useState(null);
  const beepRef = useRef(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (beepRef.current) clearInterval(beepRef.current);
    };
  }, []);

  useEffect(() => {
    if (!patient?._id) return;
    const storageKey = `neuronest_reminders_${patient._id}`;

    const check = () => {
      const now = new Date();
      const ct = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      try {
        let saved = localStorage.getItem(storageKey);
        if (!saved) {
          const oldSaved = localStorage.getItem('neuronest_reminders');
          if (oldSaved) saved = oldSaved;
        }
        if (!saved) return;

        const reminders = JSON.parse(saved);
        reminders.forEach(r => {
          if (r.status === 'pending' && r.time === ct) {
            const lastRang = localStorage.getItem(`neuronest_rang_${r._id}`);
            const today = new Date().toDateString();
            if (lastRang !== today && !alarmReminder) {
              triggerAlarm(r);
            }
          }
        });
      } catch (e) {}
    };

    const iv = setInterval(check, 5000);
    check();
    return () => clearInterval(iv);
  }, [patient?._id, alarmReminder]);

  const triggerAlarm = (r) => {
    if (beepRef.current) clearInterval(beepRef.current);
    setAlarmReminder(r);
    
    localStorage.setItem(`neuronest_rang_${r._id}`, new Date().toDateString());

    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`NeuroNest Reminder: ${r.title}`, {
        body: `It is time for your reminder at ${formatTime(r.time)}.\n${r.notes || ''}`,
        icon: '/favicon.ico',
        requireInteraction: true
      });
      notification.onclick = () => {
        window.focus();
        navigate('/reminders');
        notification.close();
      };
    }

    beepRef.current = setInterval(() => playBeep(), 2000);
    playBeep();
  };

  const stopAlarm = () => {
    if (beepRef.current) { clearInterval(beepRef.current); beepRef.current = null; }
    setAlarmReminder(null);
  };

  const handleComplete = () => {
    if (!alarmReminder || !patient?._id) return;
    const storageKey = `neuronest_reminders_${patient._id}`;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        let reminders = JSON.parse(saved);
        reminders = reminders.map(r => r._id === alarmReminder._id ? { ...r, status: 'completed' } : r);
        localStorage.setItem(storageKey, JSON.stringify(reminders));
        
        window.dispatchEvent(new Event('neuronest_reminders_updated'));
      }
    } catch (e) {}

    stopAlarm();
  };

  if (!alarmReminder) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] animate-fade-up" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-card p-10 max-w-lg w-full mx-4 animate-scale-in" style={{ boxShadow: '0 0 60px rgba(255,100,100,0.6)', border: '3px solid rgba(255,100,100,0.4)' }}>
        <div className="text-center">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }} className="animate-bounce">
            <IconBell size={72} color="#e74c3c" />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#2d5016' }}>Reminder Alert!</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <span className="font-bold text-2xl" style={{ color: '#1a1a1a' }}>{alarmReminder.title}</span>
          </div>
          {alarmReminder.notes && <p className="text-base mb-6 p-4 rounded-xl" style={{ color: '#4a5a4a', background: 'rgba(240,250,240,0.5)' }}>{alarmReminder.notes}</p>}
          <p className="text-2xl font-bold mb-8" style={{ color: '#5a9a5a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <IconClock size={22} color="#5a9a5a" /> {formatTime(alarmReminder.time)}
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleComplete} className="btn-green flex-1 text-lg py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <IconDone size={20} color="#fff" /> Mark Complete
          </button>
          <button onClick={stopAlarm} className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105" style={{ background: 'rgba(240,240,240,0.95)', border: '2px solid rgba(100,100,100,0.3)', color: '#4a5a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <IconSnooze size={22} color="#4a5a4a" /> Snooze
          </button>
        </div>
      </div>
    </div>
  );
}
