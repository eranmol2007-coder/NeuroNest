import React, { useState, useEffect, useRef } from 'react';
import { usePatient } from '../context/PatientContext.jsx';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const TYPE_META = {
  medicine: { key: 'medicine', label: 'Medicine' },
  water: { key: 'water', label: 'Water' },
  appointment: { key: 'appointment', label: 'Appointment' },
  meal: { key: 'meal', label: 'Meal' },
  exercise: { key: 'exercise', label: 'Exercise' },
};

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

function IconPulse({ size = 40, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="2" opacity="0.2" />
      <circle cx="20" cy="20" r="12" stroke={color} strokeWidth="1.5" opacity="0.3" />
      <path d="M6 20 L14 20 L18 10 L22 30 L26 16 L30 20 L38 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function IconHourglass({ size = 40, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M12 6 H28 V11 C28 17 24 20 20 24 C16 20 12 17 12 11 V6Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={`${color}12`} />
      <path d="M12 34 H28 V29 C28 23 24 20 20 16 C16 20 12 23 12 29 V34Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={`${color}08`} />
      <line x1="10" y1="6" x2="30" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="34" x2="30" y2="34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function IconBadge({ size = 40, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="2" opacity="0.2" strokeDasharray="4 3" />
      <circle cx="20" cy="20" r="12" stroke={color} strokeWidth="1.5" fill={`${color}08`} />
      <path d="M13 20 L18 25 L27 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBell({ size = 48, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M18 20 C18 14 21 8 24 7 C27 8 30 14 30 20 V28 L36 34 H12 L18 28 V20Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={`${color}10`} />
      <path d="M21 34 C21 37 22.5 40 24 40 C25.5 40 27 37 27 34" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

function IconMedicine({ size = 26, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect x="9" y="2" width="8" height="9" rx="2" stroke={color} strokeWidth="1.8" fill={`${color}12`} />
      <rect x="8" y="11" width="10" height="13" rx="2.5" stroke={color} strokeWidth="1.8" fill={`${color}18`} />
      <line x1="13" y1="13" x2="13" y2="22" stroke={color} strokeWidth="1.2" opacity="0.4" />
    </svg>
  );
}

function IconWater({ size = 26, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <path d="M13 2 L19 12 C19 18 16.5 22 13 23 C9.5 22 7 18 7 12 L13 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill={`${color}15`} />
    </svg>
  );
}

function IconAppointment({ size = 26, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <rect x="2" y="5" width="22" height="18" rx="3" stroke={color} strokeWidth="1.8" fill={`${color}08`} />
      <line x1="2" y1="11" x2="24" y2="11" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="2" x2="8" y2="7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="2" x2="18" y2="7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconMeal({ size = 26, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <ellipse cx="13" cy="17" rx="10" ry="6" stroke={color} strokeWidth="1.8" fill={`${color}10`} />
      <path d="M6 17 C6 12 9 8 13 7 C17 8 20 12 20 17" stroke={color} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

function IconExercise({ size = 26, color = '#3d7a3d' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="5" r="2.5" stroke={color} strokeWidth="1.8" fill={`${color}12`} />
      <path d="M7 12 L10 10 L13 13 L16 10 L19 12" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M13 13 L13 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 24 L13 19 L17 24" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

function IconTrash({ size = 14, color = '#ef4444' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2.5 4 H11.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 4 V2.5 C5 2 5.5 1.5 6 1.5 H8 C8.5 1.5 9 2 9 2.5 V4" stroke={color} strokeWidth="1.3" />
      <path d="M3.5 4 L4 12 C4 12.5 4.5 13 5 13 H9 C9.5 13 10 12.5 10 12 L10.5 4" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
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

const REMINDER_ICONS = { medicine: IconMedicine, water: IconWater, appointment: IconAppointment, meal: IconMeal, exercise: IconExercise };

export default function RemindersPage() {
  const { patient } = usePatient();
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [alarmReminder, setAlarmReminder] = useState(null);
  const beepRef = useRef(null);

  const [type, setType] = useState('medicine');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');
  const [recurring, setRecurring] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('neuronest_reminders');
    if (saved) try { setReminders(JSON.parse(saved)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('neuronest_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const ct = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      reminders.forEach(r => {
        if (r.status === 'pending' && r.time === ct && !alarmReminder) triggerAlarm(r);
      });
    };
    const iv = setInterval(check, 10000);
    check();
    return () => clearInterval(iv);
  }, [reminders, alarmReminder]);

  const triggerAlarm = (r) => {
    setAlarmReminder(r);
    beepRef.current = setInterval(() => playBeep(), 2000);
    playBeep();
  };

  const stopAlarm = () => {
    if (beepRef.current) { clearInterval(beepRef.current); beepRef.current = null; }
    setAlarmReminder(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const t24 = `${String(h).padStart(2, '0')}:${minute}`;
    const nr = { _id: `local-${Date.now()}`, type, title, notes, time: t24, isRecurring: recurring, status: 'pending', createdAt: new Date().toISOString() };
    setReminders(prev => [...prev, nr]);
    setType('medicine'); setTitle(''); setNotes(''); setHour('12'); setMinute('00'); setPeriod('AM'); setRecurring(true); setShowForm(false);
  };

  const handleComplete = (id) => {
    setReminders(prev => prev.map(r => r._id === id ? { ...r, status: 'completed' } : r));
    if (alarmReminder?._id === id) stopAlarm();
  };

  const handleDelete = (id) => {
    setReminders(prev => prev.filter(r => r._id !== id));
    if (alarmReminder?._id === id) stopAlarm();
  };

  const pending = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status === 'completed');
  const upcoming = pending.filter(r => {
    const now = new Date();
    const [h, m] = r.time.split(':').map(Number);
    const rt = new Date(); rt.setHours(h, m, 0, 0);
    return rt > now;
  });

  const formatTime = (t24) => {
    const [h, m] = t24.split(':');
    const hr = parseInt(h); const p = hr >= 12 ? 'PM' : 'AM';
    const h12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return `${h12}:${m} ${p}`;
  };

  const sections = [
    { key: 'active', title: 'Active', count: pending.length, items: pending, empty: 'No active reminders', Icon: IconPulse },
    { key: 'upcoming', title: 'Upcoming', count: upcoming.length, items: upcoming, empty: 'No upcoming', Icon: IconHourglass },
    { key: 'history', title: 'History', count: completed.length, items: completed, empty: 'No completed', Icon: IconBadge },
  ];

  return (
    <div className="modern-page" style={{ position: 'relative', background: 'transparent', minHeight: '100vh' }}>
      <Animated3DBackground />
      <div className="page-container" style={{ paddingTop: '40px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '40px 48px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <IconBell size={48} color="#3d7a3d" />
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a2e1a' }}>Reminders</h1>
              <p className="text-base font-medium" style={{ color: '#4a5a4a' }}>{pending.length} active · {completed.length} completed</p>
            </div>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="home-footer-link !w-auto !mt-0 !px-6 !py-3 !text-sm font-bold" style={{ borderRadius: '14px' }}>
            {showForm ? 'Cancel' : '+ Add Reminder'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card animate-fade-up p-8" style={{ marginBottom: '32px' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#1a2e1a' }}>Create New Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="glass-input">
                    {Object.entries(TYPE_META).map(([k, m]) => (<option key={k} value={k}>{m.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Time</label>
                  <div className="flex gap-2 items-center">
                    <select value={hour} onChange={(e) => setHour(e.target.value)} className="glass-input" style={{ width: '100px', fontSize: '20px', padding: '16px 12px', textAlign: 'center' }}>
                      {[12,1,2,3,4,5,6,7,8,9,10,11].map(h => (<option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>))}
                    </select>
                    <span className="text-3xl" style={{ color: '#1a1a1a' }}>:</span>
                    <select value={minute} onChange={(e) => setMinute(e.target.value)} className="glass-input" style={{ width: '100px', fontSize: '20px', padding: '16px 12px', textAlign: 'center' }}>
                      {Array.from({ length: 60 }, (_, i) => i).map(m => (<option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>))}
                    </select>
                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="glass-input" style={{ width: '90px', fontSize: '20px', padding: '16px 12px', textAlign: 'center' }}>
                      <option value="AM">AM</option><option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Take morning medication" required className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional details..." rows="2" className="glass-input" />
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: '#1a1a1a' }}>
                <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="w-4 h-4 rounded accent-green-600" />
                <span>Repeat daily</span>
              </label>
              <button type="submit" className="btn-green w-full text-lg py-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconDone size={18} color="#fff" /> Save Reminder
              </button>
            </form>
          </div>
        )}

        {/* 3 Equal Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', margin: '0' }}>
          {sections.map(({ key, title: t, count, items, empty, Icon }) => (
            <div key={key} className="glass-card p-6" style={{ display: 'flex', flexDirection: 'column', height: '520px', margin: '0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <Icon size={36} color="#3d7a3d" />
                  <h2 className="text-2xl font-bold" style={{ color: '#1a2e1a' }}>{t}</h2>
                </div>
                <p className="text-sm" style={{ color: '#5a9a5a' }}>{count} {key === 'active' ? (count !== 1 ? 'reminders' : 'reminder') : key === 'upcoming' ? 'scheduled' : 'completed'}</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '20px', overflowY: 'auto' }}>
                {items.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={72} color="#c0dcc0" />
                    <p className="text-base mt-4" style={{ color: '#999' }}>{empty}</p>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map(r => {
                      const IconComp = REMINDER_ICONS[r.type] || IconClock;
                      return (
                        <div key={r._id} style={{ padding: '14px', borderRadius: '14px', background: 'rgba(240,250,240,0.6)', border: '1.5px solid rgba(122,170,122,0.4)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <IconComp size={26} color="#3d7a3d" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="font-bold text-base truncate" style={{ color: '#1a1a1a' }}>{r.title}</p>
                              <p className="text-sm font-semibold mt-1" style={{ color: '#5a9a5a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <IconClock size={14} color="#5a9a5a" /> {formatTime(r.time)}
                              </p>
                              {r.notes && <p className="text-xs mt-1" style={{ color: '#666' }}>{r.notes}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {key === 'active' && (
                              <button onClick={() => handleComplete(r._id)} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#5a9a5a', color: '#fff', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <IconDone size={12} /> Done
                              </button>
                            )}
                            <button onClick={() => handleDelete(r._id)} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '12px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <IconTrash size={12} color="#ef4444" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Alarm */}
        {alarmReminder && (
          <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-up" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <div className="glass-card p-10 max-w-lg w-full mx-4 animate-scale-in" style={{ boxShadow: '0 0 60px rgba(255,100,100,0.6)', border: '3px solid rgba(255,100,100,0.4)' }}>
              <div className="text-center">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }} className="animate-bounce"><IconBell size={72} color="#e74c3c" /></div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#2d5016' }}>Reminder Alert!</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                  {REMINDER_ICONS[alarmReminder.type] && React.createElement(REMINDER_ICONS[alarmReminder.type], { size: 36, color: '#3d7a3d' })}
                  <span className="font-bold text-2xl" style={{ color: '#1a1a1a' }}>{alarmReminder.title}</span>
                </div>
                {alarmReminder.notes && <p className="text-base mb-6 p-4 rounded-xl" style={{ color: '#4a5a4a', background: 'rgba(240,250,240,0.5)' }}>{alarmReminder.notes}</p>}
                <p className="text-2xl font-bold mb-8" style={{ color: '#5a9a5a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <IconClock size={22} color="#5a9a5a" /> {formatTime(alarmReminder.time)}
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => handleComplete(alarmReminder._id)} className="btn-green flex-1 text-lg py-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <IconDone size={20} color="#fff" /> Mark Complete
                </button>
                <button onClick={stopAlarm} className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105" style={{ background: 'rgba(240,240,240,0.95)', border: '2px solid rgba(100,100,100,0.3)', color: '#4a5a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <IconSnooze size={22} color="#4a5a4a" /> Snooze
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
