import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { usePatient } from '../context/PatientContext.jsx';
import { caregiversApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const GAME_LABELS = { memoryMatch: 'Memory Match', patternRecognition: 'Pattern Recognition', dailyRoutineRecall: 'Daily Routine' };

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
    },
  },
};

const lineChartOpts = {
  ...baseChartOpts,
  scales: {
    x: {
      ticks: { color: '#5a6a5a', font: { size: 10, weight: '500' }, maxRotation: 0, minRotation: 0, padding: 8, autoSkip: true, maxTicksLimit: 6 },
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

export default function CaregiverReportsPage() {
  const { patient } = usePatient();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!patient?.caregiverId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await caregiversApi.getDashboard(patient.caregiverId);
      setDashboard(res.data);
      await cacheSet('caregiverDashboard', res.data);
    } catch {
      const cached = await cacheGet('caregiverDashboard');
      if (cached) { setDashboard(cached); setError('Showing cached data.'); }
      else setError('Could not load reports.');
    } finally { setLoading(false); }
  }, [patient]);

  useEffect(() => { load(); }, [load]);

  if (!patient?.caregiverId) return <div className="max-w-2xl mx-auto px-8 animate-fade-up" style={{ paddingTop: '120px' }}><div className="glass-card text-center py-12"><p className="text-lg" style={{ color: '#666' }}>No patient linked.</p></div></div>;
  if (loading) return <div className="max-w-2xl mx-auto px-8" style={{ paddingTop: '120px' }}><div className="py-16 text-center"><div className="w-8 h-8 mx-auto border-2 border-green-500/30 border-t-green-600 rounded-full animate-spin-slow" /></div></div>;

  const scores = dashboard?.scores || [];
  const moodTrend = dashboard?.moodTrend || [];
  const perf = dashboard?.performanceSummary || [];

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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a2e1a' }}>Patient Reports</h1>
          <p className="text-base font-medium" style={{ color: '#4a5a4a' }}>{dashboard?.patient?.name || 'Patient'}'s cognitive performance</p>
        </div>
        <button onClick={load} className="home-footer-link !w-auto !mt-0 !px-6 !py-3 !text-sm font-bold" style={{ borderRadius: '14px' }}>Refresh</button>
      </div>

      {error && <div className="glass-card px-6 py-4 mb-6"><p className="text-sm font-semibold" style={{ color: '#d97706' }}>{error}</p></div>}

      {dashboard?.patient && (
        <>
          {/* Patient summary bar */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '20px', marginBottom: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <p className="text-sm font-semibold" style={{ color: '#666' }}>Patient</p>
              <p className="text-xl font-bold" style={{ color: '#2a5a2a' }}>{dashboard.patient.name}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="text-sm font-semibold" style={{ color: '#666' }}>Age</p>
              <p className="text-xl font-bold" style={{ color: '#2a5a2a' }}>{dashboard.patient.age || 'N/A'}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="text-sm font-semibold" style={{ color: '#666' }}>Difficulty</p>
              <p className="text-xl font-bold capitalize" style={{ color: '#2a5a2a' }}>{dashboard.patient.currentDifficulty}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p className="text-sm font-semibold" style={{ color: '#666' }}>Games Played</p>
              <p className="text-xl font-bold" style={{ color: '#2a5a2a' }}>{scores.length}</p>
            </div>
            {scores.length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <p className="text-sm font-semibold" style={{ color: '#666' }}>Avg Accuracy</p>
                <p className="text-xl font-bold" style={{ color: '#2a5a2a' }}>{Math.round(scores.reduce((a, s) => a + s.accuracy, 0) / scores.length)}%</p>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div className="glass-card chart-box" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Accuracy Over Time</p>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {scores.length > 0 ? <Line data={accuracyData} options={lineChartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
              </div>
            </div>
            <div className="glass-card chart-box" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Mood Trend</p>
              <div style={{ position: 'relative', height: '260px', flex: 'none' }}>
                {moodTrend.length > 0 ? <Line data={moodData} options={moodChartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
            <p className="text-xl font-bold mb-4" style={{ color: '#1a2e1a' }}>Performance by Game</p>
            {perf.length > 0 ? <Bar data={perfData} options={barChartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
          </div>

          {/* Performance summary */}
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
        </>
      )}
    </div>
  );
}
