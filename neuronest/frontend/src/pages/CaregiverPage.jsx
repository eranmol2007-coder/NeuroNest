import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { usePatient } from '../context/PatientContext.jsx';
import { caregiversApi, alertsApi, personalStoriesApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const GAME_LABELS = { memoryMatch: 'Memory Match', patternRecognition: 'Pattern Recognition', dailyRoutineRecall: 'Daily Routine' };

const baseChartOpts = {
  responsive: true, maintainAspectRatio: true, interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { labels: { color: '#1a2e1a', font: { size: 12, weight: '700' }, padding: 16, usePointStyle: true, pointStyleWidth: 14 } },
    tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', titleColor: '#1a2e1a', bodyColor: '#2a5a2a', borderColor: 'rgba(122,170,122,0.4)', borderWidth: 1, padding: 12, cornerRadius: 10, titleFont: { weight: '700', size: 13 }, bodyFont: { size: 12 } },
  },
};
const lineChartOpts = { ...baseChartOpts, scales: { x: { ticks: { color: '#5a6a5a', font: { size: 10, weight: '500' }, maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 6 }, grid: { color: 'rgba(122,170,122,0.08)' }, border: { display: false } }, y: { min: 0, ticks: { color: '#5a6a5a', font: { size: 11 }, stepSize: 20 }, grid: { color: 'rgba(122,170,122,0.1)' }, border: { display: false } } }, layout: { padding: { left: 8, right: 8, top: 4, bottom: 4 } }, elements: { line: { borderWidth: 3, tension: 0.4, fill: true }, point: { radius: 5, hoverRadius: 7, borderWidth: 2, borderColor: '#fff' } } };
const moodChartOpts = {
  responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: true, position: 'top', align: 'end', labels: { color: '#1a2e1a', font: { size: 11, weight: '600' }, padding: 12, usePointStyle: true, pointStyleWidth: 10 } },
    tooltip: { backgroundColor: 'rgba(255,255,255,0.96)', titleColor: '#1a2e1a', bodyColor: '#2a5a2a', borderColor: 'rgba(90,138,90,0.3)', borderWidth: 1, padding: 10, cornerRadius: 8, titleFont: { weight: '700', size: 12 }, bodyFont: { size: 11 }, callbacks: { label: (ctx) => { const labels = { 1: 'Bad', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' }; return ` Mood: ${labels[ctx.parsed.y] || ctx.parsed.y}`; } } },
  },
  scales: {
    x: { ticks: { color: '#6b7b6b', font: { size: 9 }, maxRotation: 45, minRotation: 30, autoSkip: true, maxTicksLimit: 5, padding: 4 }, grid: { display: false }, border: { display: false } },
    y: { min: 0, max: 5.5, ticks: { color: '#6b7b6b', font: { size: 10, weight: '500' }, stepSize: 1, padding: 8, callback: (v) => { const labels = { 0: '', 1: 'Bad', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' }; return labels[v] !== undefined ? labels[v] : ''; }, autoSkip: false }, grid: { color: 'rgba(90,138,90,0.08)', lineWidth: 1 }, border: { display: false } },
  },
  layout: { padding: { left: 4, right: 8, top: 16, bottom: 0 } },
  elements: { line: { borderWidth: 2.5, tension: 0.35, fill: true }, point: { radius: 4, hoverRadius: 6, borderWidth: 2, borderColor: '#fff', backgroundColor: '#5a8a5a' } },
};
const barChartOpts = { ...baseChartOpts, scales: { x: { ticks: { color: '#5a6a5a', font: { size: 11, weight: '600' } }, grid: { display: false }, border: { display: false } }, y: { min: 0, max: 100, ticks: { color: '#5a6a5a', stepSize: 20 }, grid: { color: 'rgba(122,170,122,0.1)' }, border: { display: false } } }, plugins: { ...baseChartOpts.plugins }, barThickness: 40 };

export default function CaregiverPage() {
  const { patient } = usePatient();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storyStats, setStoryStats] = useState(null);

  const load = useCallback(async () => {
    if (!patient?.caregiverId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [dashRes, statsRes] = await Promise.all([
        caregiversApi.getDashboard(patient.caregiverId),
        personalStoriesApi.getStats(patient.caregiverId).catch(() => ({ data: null })),
      ]);
      setDashboard(dashRes.data);
      setStoryStats(statsRes.data);
      await cacheSet('caregiverDashboard', dashRes.data);
    } catch {
      const cached = await cacheGet('caregiverDashboard');
      if (cached) setDashboard(cached);
      else setError('Could not load dashboard.');
    } finally { setLoading(false); }
  }, [patient]);

  useEffect(() => { load(); }, [load]);

  const handleResolveAlert = async (id) => {
    setDashboard((p) => ({ ...p, alerts: p.alerts.map((a) => (a._id === id ? { ...a, resolved: true } : a)) }));
    try { await alertsApi.resolve(id); } catch {}
  };

  if (!patient?.caregiverId) return <div style={{ maxWidth: '600px', margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}><p style={{ color: '#666', fontSize: '16px' }}>No patient linked.</p></div>;
  if (loading) return <div style={{ padding: '120px 24px', textAlign: 'center' }}><div style={{ width: '32px', height: '32px', margin: '0 auto', border: '3px solid #c8dcc8', borderTopColor: '#3d7a3d', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;

  const alerts = dashboard?.alerts || [];
  const scores = dashboard?.scores || [];
  const moodTrend = dashboard?.moodTrend || [];
  const perf = dashboard?.performanceSummary || [];
  const unresolved = alerts.filter((a) => !a.resolved);

  const accuracyData = {
    labels: scores.map((s) => { const d = new Date(s.date); return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }),
    datasets: [{ label: 'Accuracy %', data: scores.map((s) => s.accuracy), borderColor: '#2a5a2a', backgroundColor: (ctx) => { const g = ctx.chart?.ctx?.createLinearGradient(0, 0, 0, 300); if (g) { g.addColorStop(0, 'rgba(42,90,42,0.25)'); g.addColorStop(1, 'rgba(42,90,42,0.02)'); return g; } return 'rgba(42,90,42,0.1)'; }, pointBackgroundColor: '#2a5a2a', pointBorderColor: '#fff', pointBorderWidth: 2 }],
  };
  const moodData = {
    labels: moodTrend.map((m) => { const d = new Date(m.date); return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }),
    datasets: [{ label: 'Mood', data: moodTrend.map((m) => m.moodScore), borderColor: '#5a8a5a', backgroundColor: (ctx) => { const g = ctx.chart?.ctx?.createLinearGradient(0, 0, 0, 300); if (g) { g.addColorStop(0, 'rgba(90,138,90,0.25)'); g.addColorStop(1, 'rgba(90,138,90,0.02)'); return g; } return 'rgba(90,138,90,0.1)'; }, pointBackgroundColor: '#5a8a5a', pointBorderColor: '#fff', pointBorderWidth: 2 }],
  };
  const perfData = {
    labels: perf.map((p) => GAME_LABELS[p.gameType] || p.gameType),
    datasets: [{ label: 'Avg Accuracy %', data: perf.map((p) => p.averageAccuracy), backgroundColor: 'rgba(42,90,42,0.6)', borderColor: '#2a5a2a', borderWidth: 2, borderRadius: 8, borderSkipped: false }],
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a2e1a', margin: 0 }}>Caregiver Dashboard</h1>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{dashboard?.patient?.name || 'Patient'}'s progress and alerts</p>
        </div>
        <button onClick={load} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #c8dcc8', background: '#fff', color: '#2d5a27', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Refresh</button>
      </div>

      {error && <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '24px' }}><p style={{ fontSize: '13px', fontWeight: '600', color: '#d97706' }}>{error}</p></div>}

      {dashboard?.patient && (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Patient', value: dashboard.patient.name, color: '#2a5a2a' },
              { label: 'Difficulty', value: dashboard.patient.currentDifficulty, color: '#2a5a2a', cap: true },
              { label: 'Games Played', value: scores.length, color: '#2a5a2a' },
              { label: 'Active Alerts', value: unresolved.length, color: unresolved.length > 0 ? '#ef4444' : '#2a5a2a' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid #e0ede0' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '4px' }}>{s.label}</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: s.color, textTransform: s.cap ? 'capitalize' : 'none' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Active Alerts */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #e0ede0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>
              Active Alerts {unresolved.length > 0 && <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>({unresolved.length})</span>}
            </h2>
            {unresolved.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', borderRadius: '10px', background: '#f8fdf8' }}>
                <p style={{ color: '#2a5a2a', fontWeight: '600' }}>All clear — no active alerts</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unresolved.map((alert) => (
                  <div key={alert._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div><p style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a', textTransform: 'capitalize', marginBottom: '2px' }}>{alert.type.replace(/_/g, ' ')}</p><p style={{ fontSize: '13px', color: '#666' }}>{alert.message}</p></div>
                    <button onClick={() => handleResolveAlert(alert._id)} style={{ padding: '8px 18px', borderRadius: '8px', background: '#3d7a3d', color: '#fff', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Resolve</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0ede0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>Accuracy Over Time</h3>
              {scores.length > 0 ? <Line data={accuracyData} options={lineChartOpts} /> : <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No data yet</p>}
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0ede0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 12px' }}>Mood Trend</h3>
              <div style={{ position: 'relative', height: '260px' }}>
                {moodTrend.length > 0 ? <Line data={moodData} options={moodChartOpts} /> : <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No data yet</p>}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #e0ede0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>Performance by Game</h3>
            {perf.length > 0 ? <Bar data={perfData} options={barChartOpts} /> : <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No data yet</p>}
          </div>

          {/* Story Quiz + Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0ede0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: 0 }}>Story Quiz Performance</h3>
                <button onClick={() => navigate('/caregiver/stories')} style={{ fontSize: '13px', color: '#3d7a3d', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Manage →</button>
              </div>
              {storyStats && storyStats.totalStories > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: '#f8fdf8' }}><p style={{ fontSize: '22px', fontWeight: '700', color: '#2a5a2a' }}>{storyStats.totalStories}</p><p style={{ fontSize: '11px', color: '#888' }}>Stories</p></div>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: '#f8fdf8' }}><p style={{ fontSize: '22px', fontWeight: '700', color: '#2a5a2a' }}>{storyStats.totalQuizzes}</p><p style={{ fontSize: '11px', color: '#888' }}>Quizzes</p></div>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: '#f8fdf8' }}><p style={{ fontSize: '22px', fontWeight: '700', color: storyStats.avgAccuracy >= 70 ? '#2a5a2a' : '#d97706' }}>{storyStats.avgAccuracy}%</p><p style={{ fontSize: '11px', color: '#888' }}>Avg</p></div>
                </div>
              ) : <p style={{ textAlign: 'center', padding: '24px', color: '#999' }}>No stories yet</p>}
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0ede0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>Contact Patient</h3>
              {dashboard.patient ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: '#f8fdf8' }}><p style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a' }}>{dashboard.patient.name}</p><p style={{ fontSize: '12px', color: '#888' }}>{dashboard.patient.age ? `${dashboard.patient.age} years old` : ''} {dashboard.patient.gender ? `· ${dashboard.patient.gender}` : ''}</p></div>
                  {dashboard.patient.phone && <a href={`tel:${dashboard.patient.phone}`} style={{ display: 'block', padding: '12px', borderRadius: '10px', background: '#3d7a3d', color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>Call {dashboard.patient.phone}</a>}
                  {dashboard.patient.email && <a href={`mailto:${dashboard.patient.email}`} style={{ display: 'block', padding: '12px', borderRadius: '10px', border: '2px solid #3d7a3d', color: '#3d7a3d', textAlign: 'center', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>Email {dashboard.patient.email}</a>}
                </div>
              ) : <p style={{ textAlign: 'center', padding: '24px', color: '#999' }}>No patient linked</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
