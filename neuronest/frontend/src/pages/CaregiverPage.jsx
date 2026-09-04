import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { usePatient } from '../context/PatientContext.jsx';
import { caregiversApi, alertsApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const GAME_LABELS = { memoryMatch: 'Memory Match', patternRecognition: 'Pattern Recognition', dailyRoutineRecall: 'Daily Routine' };

const caregiverInputStyle = {
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid #c8dcc8',
  background: '#fff',
  fontSize: '14px',
  color: '#1a1a1a',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
};

function ChangeCaregiverSection({ caregiver, patientId, onUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', relationToPatient: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (caregiver) {
      setForm({ name: caregiver.name || '', email: caregiver.email || '', phone: caregiver.phone || '', relationToPatient: caregiver.relationToPatient || '' });
    }
  }, [caregiver]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (caregiver?._id) {
        await caregiversApi.update(caregiver._id, form);
      } else {
        const res = await caregiversApi.create({ ...form, linkedPatientId: patientId });
        if (patientId && res.data?._id) {
          await caregiversApi.linkPatient(res.data._id, patientId);
        }
      }
      setSuccess('Caregiver updated successfully');
      setShowForm(false);
      onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update caregiver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showForm ? '20px' : '0' }}>
        <div>
          <p className="text-xl font-bold" style={{ color: '#1a2e1a' }}>Caregiver</p>
          {caregiver && !showForm && (
            <p className="text-sm mt-1" style={{ color: '#666' }}>{caregiver.name} · {caregiver.email || caregiver.phone} · {caregiver.relationToPatient}</p>
          )}
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          style={{ padding: '10px 20px', borderRadius: '10px', background: showForm ? 'rgba(122,170,122,0.1)' : 'linear-gradient(135deg, #3d7a3d, #2d5a2d)',
            color: showForm ? '#3d7a3d' : '#fff', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          {showForm ? 'Cancel' : caregiver ? 'Change Caregiver' : 'Add Caregiver'}
        </button>
      </div>

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#444' }}>Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Caregiver name" style={caregiverInputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#444' }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="caregiver@email.com" style={caregiverInputStyle} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: '#444' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210" style={caregiverInputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: '#444' }}>Relation</label>
            <input type="text" value={form.relationToPatient} onChange={(e) => setForm({ ...form, relationToPatient: e.target.value })}
              placeholder="e.g. Son, Daughter, Nurse" style={caregiverInputStyle} />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(61,122,61,0.08)', border: '1px solid rgba(61,122,61,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#3d7a3d' }}>{success}</p>
            </div>
          )}

          <button onClick={handleSave} disabled={loading || !form.name.trim()}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)',
              color: '#fff', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading || !form.name.trim() ? 0.6 : 1, marginTop: '4px' }}>
            {loading ? 'Saving...' : 'Save Caregiver'}
          </button>

          <p className="text-xs text-center" style={{ color: '#888' }}>
            The caregiver will be able to log in with this email/phone and receive alerts and reports
          </p>
        </div>
      )}
    </div>
  );
}

const baseChartOpts = {
  responsive: true,
  maintainAspectRatio: true,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { labels: { color: '#1a2e1a', font: { size: 12, weight: '700' }, padding: 16, usePointStyle: true, pointStyleWidth: 14 } },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      titleColor: '#1a2e1a',
      bodyColor: '#2a5a2a',
      borderColor: 'rgba(122,170,122,0.4)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      titleFont: { weight: '700', size: 13 },
      bodyFont: { size: 12 },
      boxPadding: 4,
      caretSize: 6,
      displayColors: true,
      shadowOffsetX: 2,
      shadowOffsetY: 4,
      shadowBlur: 12,
      shadowColor: 'rgba(0,0,0,0.08)',
    },
  },
};

const lineChartOpts = {
  ...baseChartOpts,
  scales: {
    x: {
      ticks: { color: '#5a6a5a', font: { size: 10, weight: '500' }, maxRotation: 45, minRotation: 30, padding: 8, autoSkip: true, maxTicksLimit: 8 },
      grid: { color: 'rgba(122,170,122,0.08)', drawBorder: false, lineWidth: 1 },
      border: { display: false },
    },
    y: {
      min: 0,
      ticks: { color: '#5a6a5a', font: { size: 11, weight: '500' }, padding: 10, stepSize: 20 },
      grid: { color: 'rgba(122,170,122,0.1)', drawBorder: false, lineWidth: 1 },
      border: { display: false },
    },
  },
  elements: {
    line: { borderWidth: 3, tension: 0.4, fill: true },
    point: { radius: 5, hoverRadius: 7, borderWidth: 2, borderColor: '#fff' },
  },
};

const moodChartOpts = {
  ...lineChartOpts,
  scales: {
    ...lineChartOpts.scales,
    y: {
      ...lineChartOpts.scales.y,
      min: 0,
      max: 5,
      ticks: { ...lineChartOpts.scales.y.ticks, stepSize: 1, callback: (v) => ['', 'Bad', 'Low', 'Okay', 'Good', 'Great'][v] || v },
    },
  },
};

const barChartOpts = {
  ...baseChartOpts,
  scales: {
    x: {
      ticks: { color: '#5a6a5a', font: { size: 11, weight: '600' }, padding: 8 },
      grid: { display: false },
      border: { display: false },
    },
    y: {
      min: 0,
      max: 100,
      ticks: { color: '#5a6a5a', font: { size: 11, weight: '500' }, padding: 10, stepSize: 20 },
      grid: { color: 'rgba(122,170,122,0.1)', drawBorder: false, lineWidth: 1 },
      border: { display: false },
    },
  },
  plugins: { ...baseChartOpts.plugins },
  barThickness: 40,
  maxBarThickness: 56,
};

export default function CaregiverPage() {
  const { patient } = usePatient();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!patient?.caregiverId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await caregiversApi.getDashboard(patient.caregiverId);
      setDashboard(res.data); await cacheSet('caregiverDashboard', res.data);
    } catch {
      const cached = await cacheGet('caregiverDashboard');
      if (cached) { setDashboard(cached); setError('Showing cached data.'); }
      else setError('Could not load dashboard.');
    } finally { setLoading(false); }
  }, [patient]);

  useEffect(() => { load(); }, [load]);

  const handleResolveAlert = async (id) => {
    setDashboard((p) => ({ ...p, alerts: p.alerts.map((a) => (a._id === id ? { ...a, resolved: true } : a)) }));
    try { await alertsApi.resolve(id); } catch {}
  };

  if (!patient?.caregiverId) return <div className="max-w-2xl mx-auto px-8 animate-fade-up" style={{ paddingTop: '120px' }}><div className="glass-card text-center py-12"><p className="text-lg" style={{ color: '#666' }}>No caregiver linked. Add one from Settings.</p></div></div>;
  if (loading) return <div className="max-w-2xl mx-auto px-8" style={{ paddingTop: '120px' }}><div className="py-16 text-center"><div className="w-8 h-8 mx-auto border-2 border-green-500/30 border-t-green-600 rounded-full animate-spin-slow" /></div></div>;

  const scores = dashboard?.scores || [];
  const alerts = dashboard?.alerts || [];
  const moodTrend = dashboard?.moodTrend || [];
  const perf = dashboard?.performanceSummary || [];
  const unresolved = alerts.filter((a) => !a.resolved);

  const accuracyData = {
    labels: scores.map((s) => {
      const d = new Date(s.date);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [{
      label: 'Accuracy %',
      data: scores.map((s) => s.accuracy),
      borderColor: '#2a5a2a',
      backgroundColor: (ctx) => {
        const g = ctx.chart?.ctx?.createLinearGradient(0, 0, 0, 300);
        if (g) { g.addColorStop(0, 'rgba(42,90,42,0.25)'); g.addColorStop(1, 'rgba(42,90,42,0.02)'); return g; }
        return 'rgba(42,90,42,0.1)';
      },
      pointBackgroundColor: '#2a5a2a',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#2a5a2a',
      pointHoverBorderWidth: 3,
    }],
  };

  const moodData = {
    labels: moodTrend.map((m) => {
      const d = new Date(m.date);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [{
      label: 'Mood',
      data: moodTrend.map((m) => m.moodScore),
      borderColor: '#5a8a5a',
      backgroundColor: (ctx) => {
        const g = ctx.chart?.ctx?.createLinearGradient(0, 0, 0, 300);
        if (g) { g.addColorStop(0, 'rgba(90,138,90,0.25)'); g.addColorStop(1, 'rgba(90,138,90,0.02)'); return g; }
        return 'rgba(90,138,90,0.1)';
      },
      pointBackgroundColor: '#5a8a5a',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#5a8a5a',
      pointHoverBorderWidth: 3,
    }],
  };

  const perfData = {
    labels: perf.map((p) => GAME_LABELS[p.gameType] || p.gameType),
    datasets: [{
      label: 'Avg Accuracy %',
      data: perf.map((p) => p.averageAccuracy),
      backgroundColor: (ctx) => {
        const g = ctx.chart?.ctx?.createLinearGradient(0, 0, 0, 300);
        if (g) { g.addColorStop(0, 'rgba(42,90,42,0.7)'); g.addColorStop(1, 'rgba(42,90,42,0.3)'); return g; }
        return 'rgba(42,90,42,0.5)';
      },
      borderColor: '#2a5a2a',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  return (
    <div className="max-w-5xl mx-auto px-8 animate-fade-up" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '40px 48px', marginBottom: '32px' }}>
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a2e1a' }}>Caregiver Dashboard</h1>
          <p className="text-base font-medium" style={{ color: '#4a5a4a' }}>Track progress and manage care</p>
        </div>
        <button onClick={load} className="home-footer-link !w-auto !mt-0 !px-6 !py-3 !text-sm font-bold" style={{ borderRadius: '14px' }}>Refresh</button>
      </div>

      {error && <div className="glass-card px-6 py-4 mb-6"><p className="text-sm font-semibold" style={{ color: '#d97706' }}>{error}</p></div>}

      {dashboard?.patient && (
        <>
          <div className="stats-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-card stat-box" style={{ textAlign: 'center', padding: '24px 16px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#666' }}>Patient</p>
              <p className="text-2xl font-bold" style={{ color: '#2a5a2a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{dashboard.patient.name}</p>
            </div>
            <div className="glass-card stat-box" style={{ textAlign: 'center', padding: '24px 16px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#666' }}>Difficulty</p>
              <p className="text-2xl font-bold capitalize" style={{ color: '#2a5a2a' }}>{dashboard.patient.currentDifficulty}</p>
            </div>
            <div className="glass-card stat-box" style={{ textAlign: 'center', padding: '24px 16px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: '#666' }}>Active Alerts</p>
              <p className="text-2xl font-bold" style={{ color: unresolved.length > 0 ? '#ef4444' : '#2a5a2a' }}>{unresolved.length}</p>
            </div>
          </div>

          <div className="charts-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-card chart-box" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Accuracy Over Time</p>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {scores.length > 0 ? <Line data={accuracyData} options={lineChartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
              </div>
            </div>
            <div className="glass-card chart-box" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Mood Trend</p>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {moodTrend.length > 0 ? <Line data={moodData} options={moodChartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Performance by Game</p>
            {perf.length > 0 ? <Bar data={perfData} options={barChartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Recent Alerts</p>
            {alerts.length === 0 && <p className="text-center py-8" style={{ color: '#999' }}>No alerts</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {unresolved.map((alert) => (
                <div key={alert._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(122,170,122,0.2)' }}>
                  <div style={{ minWidth: 0 }}>
                    <p className="font-bold text-base capitalize mb-1" style={{ color: '#1a1a1a' }}>{alert.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm" style={{ color: '#666' }}>{alert.message}</p>
                  </div>
                  <button onClick={() => handleResolveAlert(alert._id)} style={{ padding: '8px 20px', borderRadius: '10px', background: '#3d7a3d', color: '#fff', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary & Contact Patient */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', marginBottom: '32px' }}>
            {/* Performance Summary */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Performance Summary</p>
              {scores.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'rgba(122,170,122,0.06)' }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>Total Games Played</span>
                    <span style={{ fontWeight: '700', color: '#2a5a2a' }}>{scores.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'rgba(122,170,122,0.06)' }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>Average Accuracy</span>
                    <span style={{ fontWeight: '700', color: '#2a5a2a' }}>{Math.round(scores.reduce((a, s) => a + s.accuracy, 0) / scores.length)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'rgba(122,170,122,0.06)' }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>Latest Accuracy</span>
                    <span style={{ fontWeight: '700', color: scores[0]?.accuracy < 40 ? '#ef4444' : '#2a5a2a' }}>{scores[0]?.accuracy ?? 0}%</span>
                  </div>
                  {moodTrend.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'rgba(122,170,122,0.06)' }}>
                      <span style={{ color: '#666', fontSize: '14px' }}>Current Mood</span>
                      <span style={{ fontWeight: '700', color: '#2a5a2a' }}>{['', 'Bad', 'Low', 'Okay', 'Good', 'Great'][moodTrend[moodTrend.length - 1]?.moodScore] || 'N/A'}</span>
                    </div>
                  )}
                  {scores.length > 0 && scores[0]?.accuracy < 40 && (
                    <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', marginTop: '4px' }}>
                      <p style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                        Patient's latest accuracy is low. Consider reaching out.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: '#999' }}>No game data yet</p>
              )}
            </div>

            {/* Contact Patient */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Contact Patient</p>
              {dashboard?.patient ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', borderRadius: '12px', background: 'rgba(122,170,122,0.06)', marginBottom: '8px' }}>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a2e1a', marginBottom: '4px' }}>{dashboard.patient.name}</p>
                    <p style={{ fontSize: '13px', color: '#666' }}>{dashboard.patient.age ? `${dashboard.patient.age} years old` : ''} {dashboard.patient.gender ? `· ${dashboard.patient.gender}` : ''}</p>
                  </div>
                  {dashboard.patient.phone && (
                    <a href={`tel:${dashboard.patient.phone}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)', color: '#fff', textDecoration: 'none', fontWeight: '700', fontSize: '14px', justifyContent: 'center', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 12.5C16 13 15.5 13.5 15 13.5C14 13.5 13 13 12 12.5L8.5 14L9.5 10.5L6 9C5 8 4.5 7 4.5 6C4.5 5.5 5 5 5.5 5H7L7.5 3H10.5L10 5H11C12 5 13 5.5 13 6.5C13 7 12.5 8 12 8.5L10 10L13.5 11C14.5 11.5 15.5 12 16 12.5Z" fill="white"/></svg>
                      Call {dashboard.patient.phone}
                    </a>
                  )}
                  {dashboard.patient.email && (
                    <a href={`mailto:${dashboard.patient.email}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: '2px solid #3d7a3d', color: '#3d7a3d', textDecoration: 'none', fontWeight: '700', fontSize: '14px', justifyContent: 'center', background: 'rgba(61,122,61,0.04)', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="#3d7a3d" strokeWidth="1.5" fill="none"/><path d="M2 6L9 11L16 6" stroke="#3d7a3d" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Email {dashboard.patient.email}
                    </a>
                  )}
                  {!dashboard.patient.phone && !dashboard.patient.email && (
                    <div style={{ textAlign: 'center', padding: '20px', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                      <p style={{ color: '#d97706', fontSize: '13px', fontWeight: '600' }}>
                        No contact information available. Update patient details in Settings.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: '#999' }}>No patient linked</p>
              )}
            </div>
          </div>

          {/* Change Caregiver Section */}
          <ChangeCaregiverSection caregiver={dashboard?.caregiver} patientId={dashboard?.patient?._id} onUpdated={load} />
        </>
      )}
    </div>
  );
}


