import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePatient } from '../context/PatientContext.jsx';
import { remindersApi } from '../services/api';
import { queueOrSend, cacheGet, cacheSet } from '../services/offlineSync';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const TYPE_META = {
  medicine: { icon: '💊', label: 'Medicine' },
  water: { icon: '💧', label: 'Water' },
  appointment: { icon: '🏥', label: 'Appointment' },
  meal: { icon: '🍽️', label: 'Meal' },
  exercise: { icon: '🚶', label: 'Exercise' },
};

// Beep sound generator
const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.error('Error playing beep:', e);
  }
};

export default function RemindersPage() {
  const { patient } = usePatient();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [alarmReminder, setAlarmReminder] = useState(null);
  const beepIntervalRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render trigger
  
  // Form state
  const [formType, setFormType] = useState('medicine');
  const [formTitle, setFormTitle] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formHour, setFormHour] = useState('12');
  const [formMinute, setFormMinute] = useState('00');
  const [formPeriod, setFormPeriod] = useState('AM');
  const [formRecurring, setFormRecurring] = useState(true);

  // Log every render
  console.log('🔄 COMPONENT RENDER');
  console.log('Reminders array:', reminders);
  console.log('Reminders length:', reminders.length);

  // Alarm checking
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      reminders.forEach((reminder) => {
        if (reminder.status === 'pending' && reminder.time === currentTime && !alarmReminder) {
          triggerAlarm(reminder);
        }
      });
    };

    const interval = setInterval(checkReminders, 10000);
    checkReminders();

    return () => clearInterval(interval);
  }, [reminders, alarmReminder]);

  const triggerAlarm = (reminder) => {
    setAlarmReminder(reminder);
    beepIntervalRef.current = setInterval(() => playBeep(), 2000);
    playBeep();
  };

  const stopAlarm = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    setAlarmReminder(null);
  };

  const handleMarkComplete = (reminder) => {
    setReminders(prev => prev.map(r => 
      r._id === reminder._id ? { ...r, status: 'completed' } : r
    ));
    if (alarmReminder?._id === reminder._id) stopAlarm();
  };

  const handleDelete = (reminder) => {
    setReminders(prev => prev.filter(r => r._id !== reminder._id));
    if (alarmReminder?._id === reminder._id) stopAlarm();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formTitle.trim()) {
      alert('Please enter a title');
      return;
    }
    
    console.log('🚀 SUBMIT STARTED');
    console.log('Current reminders before add:', reminders);
    
    // Convert to 24-hour format
    let hour = parseInt(formHour);
    if (formPeriod === 'PM' && hour !== 12) hour += 12;
    if (formPeriod === 'AM' && hour === 12) hour = 0;
    const time24 = `${String(hour).padStart(2, '0')}:${formMinute}`;
    
    // Create new reminder with EXPLICIT status
    const newReminder = {
      _id: `local-${Date.now()}-${Math.random()}`,
      patientId: patient?._id || 'no-patient',
      type: formType,
      title: formTitle,
      notes: formNotes,
      time: time24,
      isRecurring: formRecurring,
      status: 'pending', // CRITICAL: explicitly set status
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ NEW REMINDER OBJECT:', newReminder);
    
    // Method 1: Direct array creation
    const newArray = [...reminders, newReminder];
    console.log('📦 NEW ARRAY:', newArray);
    console.log('📦 NEW ARRAY LENGTH:', newArray.length);
    
    // Update state with new array
    setReminders(newArray);
    
    // Force re-render
    setRefreshKey(prev => prev + 1);
    
    console.log('✅ STATE UPDATED');
    
    // Reset form
    setFormType('medicine');
    setFormTitle('');
    setFormNotes('');
    setFormHour('12');
    setFormMinute('00');
    setFormPeriod('AM');
    setFormRecurring(true);
    setShowForm(false);
    
    console.log('✅ FORM CLOSED');
    
    // Save to backend (async, non-blocking)
    setTimeout(() => {
      queueOrSend('POST', '/api/reminders', {
        patientId: patient._id,
        type: newReminder.type,
        title: newReminder.title,
        notes: newReminder.notes,
        time: newReminder.time,
        isRecurring: newReminder.isRecurring,
        status: 'pending'
      }, `New: ${newReminder.title}`)
        .then(res => {
          console.log('💾 Backend response:', res);
          if (res.data?.data) {
            setReminders(prev => prev.map(r => 
              r._id === newReminder._id ? res.data.data : r
            ));
          }
        })
        .catch(err => console.error('❌ Save error:', err));
    }, 100);
  };

  // Categorize reminders
  const pending = reminders.filter(r => r.status === 'pending');
  const completed = reminders.filter(r => r.status === 'completed');
  const upcoming = reminders.filter(r => {
    if (r.status !== 'pending') return false;
    const now = new Date();
    const [hour, min] = r.time.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hour, min, 0, 0);
    return reminderTime > now;
  });

  console.log('📊 RENDER STATUS:');
  console.log('Total:', reminders.length);
  console.log('Pending:', pending.length);
  console.log('Upcoming:', upcoming.length);
  console.log('Completed:', completed.length);

  return (
    <div className="modern-page" style={{ position: 'relative', background: 'transparent', minHeight: '100vh' }}>
      <Animated3DBackground />

      <div className="page-container" style={{ paddingTop: '40px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="page-hero-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '40px 48px', marginBottom: '32px' }}>
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a2e1a' }}>Reminders</h1>
            <p className="text-base font-medium" style={{ color: '#4a5a4a' }}>
              {pending.length} active · {completed.length} completed · Total: {reminders.length}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const test = {
                  _id: `test-${Date.now()}`,
                  type: 'medicine',
                  title: 'TEST REMINDER',
                  time: '14:30',
                  status: 'pending',
                  notes: 'This is a test'
                };
                console.log('TEST BUTTON: Adding', test);
                setReminders(prev => [...prev, test]);
                setRefreshKey(prev => prev + 1);
              }}
              className="home-footer-link !w-auto !mt-0 !px-6 !py-3 !text-sm font-bold" 
              style={{ borderRadius: '14px', background: 'orange' }}
            >
              🧪 TEST ADD
            </button>
            <button 
              onClick={() => setShowForm(s => !s)} 
              className="home-footer-link !w-auto !mt-0 !px-6 !py-3 !text-sm font-bold" 
              style={{ borderRadius: '14px' }}
            >
              {showForm ? 'Cancel' : '+ Add Reminder'}
            </button>
          </div>
        </div>

        {/* DEBUG PANEL */}
        <div className="glass-card p-4 mb-4" style={{ background: 'rgba(255, 255, 200, 0.95)', border: '2px solid orange' }}>
          <h3 className="font-bold mb-2">🔍 DEBUG INFO (Refresh Key: {refreshKey})</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div><strong>Total:</strong> {reminders.length}</div>
            <div><strong>Pending:</strong> {pending.length}</div>
            <div><strong>Upcoming:</strong> {upcoming.length}</div>
            <div><strong>Completed:</strong> {completed.length}</div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer font-semibold">Show All Reminders Data</summary>
            <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-40">
              {JSON.stringify(reminders, null, 2)}
            </pre>
          </details>
        </div>

        {/* Form */}
        {showForm && (
          <div className="glass-card animate-fade-up p-8" style={{ marginBottom: '32px' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Type</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)} className="glass-input">
                    {Object.entries(TYPE_META).map(([k, m]) => (
                      <option key={k} value={k}>{m.icon} {m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Time</label>
                  <div className="flex gap-2">
                    <select value={formHour} onChange={(e) => setFormHour(e.target.value)} className="glass-input flex-1">
                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => (
                        <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span className="flex items-center text-xl font-bold">:</span>
                    <select value={formMinute} onChange={(e) => setFormMinute(e.target.value)} className="glass-input flex-1">
                      {Array.from({ length: 60 }, (_, i) => i).map(m => (
                        <option key={m} value={String(m).padStart(2, '0')}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </select>
                    <select value={formPeriod} onChange={(e) => setFormPeriod(e.target.value)} className="glass-input flex-1">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Title</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} 
                  placeholder="e.g. Morning medication" required className="glass-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1a1a1a' }}>Notes</label>
                <input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} 
                  placeholder="Optional" className="glass-input" />
              </div>
              <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: '#1a1a1a' }}>
                <input type="checkbox" checked={formRecurring} 
                  onChange={(e) => setFormRecurring(e.target.checked)} className="w-4 h-4 rounded accent-green-600" />
                Repeats daily
              </label>
              <button type="submit" className="btn-green w-full">Save Reminder</button>
            </form>
          </div>
        )}

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Active Reminders */}
          <ReminderColumn
            title="📋 Active Reminders"
            subtitle={`${pending.length} reminder${pending.length !== 1 ? 's' : ''}`}
            reminders={pending}
            onComplete={handleMarkComplete}
            onDelete={handleDelete}
            emptyMessage="No active reminders"
          />

          {/* Column 2: Upcoming */}
          <ReminderColumn
            title="⏰ Upcoming"
            subtitle={`${upcoming.length} scheduled`}
            reminders={upcoming}
            onComplete={handleMarkComplete}
            onDelete={handleDelete}
            emptyMessage="No upcoming reminders"
            readOnly
          />

          {/* Column 3: History (Completed) */}
          <ReminderColumn
            title="✅ History"
            subtitle={`${completed.length} completed`}
            reminders={completed}
            onDelete={handleDelete}
            emptyMessage="No completed reminders"
            readOnly
          />
        </div>

        {/* Alarm Popup */}
        {alarmReminder && (
          <div className="fixed inset-0 flex items-center justify-center z-50" 
            style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card p-8 max-w-md w-full mx-4 animate-scale-in"
              style={{ boxShadow: '0 0 50px rgba(255, 100, 100, 0.5)', border: '2px solid rgba(255, 100, 100, 0.3)' }}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-bounce">🔔</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#2d5016' }}>Reminder Alert!</h2>
                <div className="flex items-center justify-center gap-2 text-3xl mb-4">
                  <span>{TYPE_META[alarmReminder.type]?.icon}</span>
                  <span className="font-bold" style={{ color: '#1a1a1a' }}>{alarmReminder.title}</span>
                </div>
                {alarmReminder.notes && (
                  <p className="text-base mb-4" style={{ color: '#4a5a4a' }}>{alarmReminder.notes}</p>
                )}
                <p className="text-lg font-semibold" style={{ color: '#5a9a5a' }}>Time: {alarmReminder.time}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleMarkComplete(alarmReminder)} className="btn-green flex-1">
                  ✓ Mark Complete
                </button>
                <button onClick={stopAlarm} className="px-6 py-3 rounded-xl font-semibold" 
                  style={{ background: 'rgba(240, 240, 240, 0.9)', border: '1.5px solid rgba(100, 100, 100, 0.3)' }}>
                  Snooze
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Column Component
function ReminderColumn({ title, subtitle, reminders, onComplete, onDelete, emptyMessage, readOnly }) {
  return (
    <div className="glass-card p-6" style={{ minHeight: '400px' }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a2e1a' }}>{title}</h2>
        <p className="text-sm" style={{ color: '#5a9a5a' }}>{subtitle}</p>
      </div>
      
      {reminders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: '#999' }}>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map(r => {
            const meta = TYPE_META[r.type] || { icon: '⏰', label: r.type };
            const [hour24, minute] = r.time.split(':');
            const hour = parseInt(hour24);
            const period = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const displayTime = `${hour12}:${minute} ${period}`;
            
            return (
              <div key={r._id} className="p-4 rounded-xl hover-lift" 
                style={{ background: 'rgba(240, 250, 240, 0.5)', border: '1px solid rgba(122, 170, 122, 0.3)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-2xl">{meta.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate" style={{ color: '#1a1a1a' }}>{r.title}</p>
                      <p className="text-sm" style={{ color: '#666' }}>{displayTime}</p>
                      {r.notes && <p className="text-sm mt-1" style={{ color: '#888' }}>{r.notes}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!readOnly && onComplete && (
                      <button onClick={() => onComplete(r)} 
                        className="px-3 py-1 text-xs rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700">
                        Done
                      </button>
                    )}
                    <button onClick={() => onDelete(r)} 
                      className="px-3 py-1 text-xs rounded-lg font-semibold" 
                      style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
