import React, { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { usePatient } from '../context/PatientContext.jsx';
import { caregiversApi, alertsApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const GAME_LABELS = { memoryMatch: 'Memory Match', patternRecognition: 'Pattern Recognition', dailyRoutineRecall: 'Daily Routine' };

const chartOpts = {
  responsive: true,
  scales: {
    x: { ticks: { color: '#666', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
    y: { min: 0, max: 100, ticks: { color: '#666', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
  },
  plugins: { legend: { labels: { color: '#1a1a1a', font: { size: 12, weight: '600' } } } },
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
    labels: scores.map((s) => new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [{ label: 'Accuracy %', data: scores.map((s) => s.accuracy), borderColor: '#2a5a2a', backgroundColor: 'rgba(42,90,42,0.1)', tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#2a5a2a', pointBorderColor: '#fff', pointBorderWidth: 2 }],
  };

  const moodData = {
    labels: moodTrend.map((m) => new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [{ label: 'Mood', data: moodTrend.map((m) => m.moodScore), borderColor: '#7a9a7a', backgroundColor: 'rgba(122,154,122,0.1)', tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#7a9a7a', pointBorderColor: '#fff', pointBorderWidth: 2 }],
  };

  const perfData = {
    labels: perf.map((p) => GAME_LABELS[p.gameType] || p.gameType),
    datasets: [{ label: 'Avg Accuracy %', data: perf.map((p) => p.averageAccuracy), backgroundColor: 'rgba(42,90,42,0.5)', borderColor: '#2a5a2a', borderWidth: 2, borderRadius: 12, barPercentage: 0.6 }],
  };

  return (
    <div className="max-w-5xl mx-auto px-8 animate-fade-up" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-5xl font-bold gradient-text-green animate-gradient">Caregiver Dashboard</h1>
        <button onClick={load} className="btn-glass !w-auto !px-6 !py-3 !text-sm font-semibold" style={{ color: '#1a1a1a' }}>🔄 Refresh</button>
      </div>

      {error && <div className="glass-card px-6 py-4 mb-6"><p className="text-sm font-semibold" style={{ color: '#d97706' }}>{error}</p></div>}

      {dashboard?.patient && (
        <>
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="glass-card text-center py-6 hover-lift">
              <p className="text-sm font-semibold mb-2" style={{ color: '#666' }}>Patient</p>
              <p className="text-2xl font-bold gradient-text-green animate-gradient">{dashboard.patient.name}</p>
            </div>
            <div className="glass-card text-center py-6 hover-lift">
              <p className="text-sm font-semibold mb-2" style={{ color: '#666' }}>Difficulty</p>
              <p className="text-2xl font-bold capitalize gradient-text-green animate-gradient">{dashboard.patient.currentDifficulty}</p>
            </div>
            <div className="glass-card text-center py-6 hover-lift">
              <p className="text-sm font-semibold mb-2" style={{ color: '#666' }}>Active Alerts</p>
              <p className="text-2xl font-bold" style={{ color: unresolved.length > 0 ? '#ef4444' : '#2a5a2a' }}>{unresolved.length}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <div className="glass-card p-7 hover-lift">
              <p className="text-xl font-bold mb-5 gradient-text-green animate-gradient">Accuracy Over Time</p>
              {scores.length > 0 ? <Line data={accuracyData} options={chartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
            </div>
            <div className="glass-card p-7 hover-lift">
              <p className="text-xl font-bold mb-5 gradient-text-green animate-gradient">Mood Trend</p>
              {moodTrend.length > 0 ? <Line data={moodData} options={{ ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, min: 1, max: 5 } } }} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
            </div>
          </div>

          <div className="glass-card p-7 mb-8 hover-lift">
            <p className="text-xl font-bold mb-5 gradient-text-green animate-gradient">Performance by Game</p>
            {perf.length > 0 ? <Bar data={perfData} options={chartOpts} /> : <p className="text-center py-12" style={{ color: '#999' }}>No data yet</p>}
          </div>

          <div className="glass-card p-7 hover-lift">
            <p className="text-xl font-bold mb-6 gradient-text-green animate-gradient">Recent Alerts</p>
            {alerts.length === 0 && <p className="text-center py-8" style={{ color: '#999' }}>No alerts</p>}
            <div className="space-y-3">
              {unresolved.map((alert) => (
                <div key={alert._id} className="flex items-center justify-between gap-4 p-5 rounded-xl border-2 border-transparent hover:border-green-200 transition-all" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                  <div className="min-w-0">
                    <p className="font-bold text-base capitalize mb-1" style={{ color: '#1a1a1a' }}>{alert.type.replace(/_/g, ' ')}</p>
                    <p className="text-sm" style={{ color: '#666' }}>{alert.message}</p>
                  </div>
                  <button onClick={() => handleResolveAlert(alert._id)} className="btn-green !w-auto !px-5 !py-2.5 !text-sm whitespace-nowrap">
                    ✓ Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


