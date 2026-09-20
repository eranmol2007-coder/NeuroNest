import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { usePatient } from '../context/PatientContext.jsx';
import { scoresApi, moodsApi, remindersApi, personalStoriesApi } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const GAME_LABELS = { memoryMatch: 'Memory Match', patternRecognition: 'Pattern Recognition', dailyRoutineRecall: 'Daily Routine' };

const lineOpts = {
  responsive: true, maintainAspectRatio: true, interaction: { mode: 'index', intersect: false },
  plugins: { legend: { labels: { color: '#1a2e1a', font: { size: 12, weight: '700' }, usePointStyle: true } }, tooltip: { backgroundColor: 'rgba(255,255,255,0.95)', titleColor: '#1a2e1a', bodyColor: '#2a5a2a', borderColor: 'rgba(122,170,122,0.4)', borderWidth: 1, padding: 12, cornerRadius: 10 } },
  scales: { x: { ticks: { color: '#5a6a5a', font: { size: 10 }, maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 6 }, grid: { color: 'rgba(122,170,122,0.08)' }, border: { display: false } }, y: { min: 0, ticks: { color: '#5a6a5a', stepSize: 20 }, grid: { color: 'rgba(122,170,122,0.1)' }, border: { display: false } } },
  elements: { line: { borderWidth: 3, tension: 0.4, fill: true }, point: { radius: 5, hoverRadius: 7, borderWidth: 2, borderColor: '#fff' } },
};
const moodOpts = {
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
const storyQuizOpts = {
  responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: true, position: 'top', align: 'end', labels: { color: '#1a2e1a', font: { size: 11, weight: '600' }, padding: 12, usePointStyle: true, pointStyleWidth: 10 } },
    tooltip: { backgroundColor: 'rgba(255,255,255,0.96)', titleColor: '#1a2e1a', bodyColor: '#5a3a6a', borderColor: 'rgba(122,90,138,0.3)', borderWidth: 1, padding: 10, cornerRadius: 8, titleFont: { weight: '700', size: 12 }, bodyFont: { size: 11 }, callbacks: { label: (ctx) => ` Quiz Score: ${ctx.parsed.y}%` } },
  },
  scales: {
    x: { ticks: { color: '#6b7b6b', font: { size: 9 }, maxRotation: 45, minRotation: 30, autoSkip: true, maxTicksLimit: 5, padding: 4 }, grid: { display: false }, border: { display: false } },
    y: { min: 0, max: 100, ticks: { color: '#6b7b6b', font: { size: 10, weight: '500' }, stepSize: 25, padding: 8, callback: (v) => `${v}%` }, grid: { color: 'rgba(122,90,138,0.08)', lineWidth: 1 }, border: { display: false } },
  },
  layout: { padding: { left: 4, right: 8, top: 16, bottom: 0 } },
  elements: { line: { borderWidth: 2.5, tension: 0.35, fill: true }, point: { radius: 5, hoverRadius: 7, borderWidth: 2, borderColor: '#fff', backgroundColor: '#7a5a8a' } },
};

const barOpts = { ...lineOpts, scales: { x: { ticks: { color: '#5a6a5a', font: { size: 11, weight: '600' } }, grid: { display: false }, border: { display: false } }, y: { min: 0, max: 100, ticks: { stepSize: 20 } } }, barThickness: 40 };

export default function PatientReportPage() {
  const { patient } = usePatient();
  const [scores, setScores] = useState([]);
  const [moods, setMoods] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [storyQuizzes, setStoryQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    if (!patient?._id) { setLoading(false); return; }
    try {
      const [scoresRes, moodsRes, remindersRes, quizRes] = await Promise.all([
        scoresApi.getForPatient(patient._id).catch(() => ({ data: [] })),
        moodsApi.getForPatient(patient._id, 30).catch(() => ({ data: [] })),
        remindersApi.getForPatient(patient._id).catch(() => ({ data: [] })),
        personalStoriesApi.getQuizResults(patient._id).catch(() => ({ data: [] })),
      ]);
      let fetchedScores = scoresRes.data || [];

      if (fetchedScores.length === 0 && patient.gameHistory?.length > 0) {
        fetchedScores = patient.gameHistory.map(g => ({
          gameType: g.gameType, accuracy: g.accuracy, timeTaken: g.timeTaken,
          difficulty: g.difficulty, date: g.date,
        }));
      }

      setScores(fetchedScores);
      setMoods(moodsRes.data || []);
      setReminders(remindersRes.data || []);
      setStoryQuizzes(quizRes.data || []);
    } catch {} finally { setLoading(false); }
  }, [patient]);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 2000);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  if (loading) return <div style={{ padding: '120px 24px', textAlign: 'center' }}><div style={{ width: '32px', height: '32px', margin: '0 auto', border: '3px solid #c8dcc8', borderTopColor: '#3d7a3d', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;

  const avgAccuracy = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.accuracy, 0) / scores.length) : 0;
  const latestMood = moods.length > 0 ? moods[moods.length - 1].moodScore : null;
  const pendingReminders = reminders.filter(r => r.status !== 'completed' && r.status !== 'dismissed').length;
  const uniqueStories = [...new Set(storyQuizzes.map(q => q.storyId))];
  const avgQuizAccuracy = storyQuizzes.length > 0 ? Math.round(storyQuizzes.reduce((a, q) => a + q.accuracy, 0) / storyQuizzes.length) : 0;

  const sortedScores = [...scores].sort((a, b) => new Date(a.date) - new Date(b.date));
  const accuracyData = {
    labels: sortedScores.map(s => { const d = new Date(s.date); return isNaN(d) ? 'N/A' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }),
    datasets: [{ label: 'Accuracy %', data: sortedScores.map(s => s.accuracy), borderColor: '#2a5a2a', backgroundColor: 'rgba(42,90,42,0.1)', pointBackgroundColor: '#2a5a2a', pointBorderColor: '#fff', pointBorderWidth: 2 }],
  };

  const sortedMoods = [...moods].sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
  const moodData = {
    labels: sortedMoods.map(m => { const d = new Date(m.date || m.createdAt); return isNaN(d) ? 'N/A' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }),
    datasets: [{ label: 'Mood', data: sortedMoods.map(m => m.moodScore), borderColor: '#5a8a5a', backgroundColor: 'rgba(90,138,90,0.1)', pointBackgroundColor: '#5a8a5a', pointBorderColor: '#fff', pointBorderWidth: 2 }],
  };

  const gameStats = {};
  scores.forEach(s => { if (!gameStats[s.gameType]) gameStats[s.gameType] = []; gameStats[s.gameType].push(s.accuracy); });
  const perfData = {
    labels: Object.keys(gameStats).map(k => GAME_LABELS[k] || k),
    datasets: [{ label: 'Avg Accuracy %', data: Object.values(gameStats).map(arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)), backgroundColor: 'rgba(42,90,42,0.6)', borderColor: '#2a5a2a', borderWidth: 2, borderRadius: 8, borderSkipped: false }],
  };

  const sortedStoryQuizzes = [...storyQuizzes].sort((a, b) => {
    const dateA = new Date(a.date || a.completedAt || a.createdAt);
    const dateB = new Date(b.date || b.completedAt || b.createdAt);
    return dateA - dateB;
  });

  const storyQuizData = {
    labels: sortedStoryQuizzes.map(q => { const d = new Date(q.date || q.completedAt || q.createdAt); return isNaN(d) ? 'N/A' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }),
    datasets: [{
      label: 'Quiz Score %',
      data: sortedStoryQuizzes.map(q => q.accuracy),
      borderColor: '#7a5a8a',
      backgroundColor: (ctx) => { const g = ctx.chart?.ctx?.createLinearGradient(0, 0, 0, 260); if (g) { g.addColorStop(0, 'rgba(122,90,138,0.25)'); g.addColorStop(1, 'rgba(122,90,138,0.02)'); return g; } return 'rgba(122,90,138,0.1)'; },
      pointBackgroundColor: '#7a5a8a',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }],
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a2e1a', margin: 0 }}>My Report</h1>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Your cognitive health and progress</p>
        </div>
        <button onClick={load} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #c8dcc8', background: '#f0f7f0', color: '#2d5a27', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>↻ Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Games Played', value: scores.length, color: '#2a5a2a' },
          { label: 'Avg Accuracy', value: `${avgAccuracy}%`, color: avgAccuracy >= 70 ? '#2a5a2a' : '#d97706' },
          { label: 'Current Mood', value: latestMood ? ['', 'Bad', 'Low', 'Okay', 'Good', 'Great'][latestMood] : 'N/A', color: '#2a5a2a' },
          { label: 'Stories Read', value: uniqueStories.length, color: '#7a5a8a' },
          { label: 'Story Quiz Avg', value: storyQuizzes.length > 0 ? `${avgQuizAccuracy}%` : 'N/A', color: avgQuizAccuracy >= 70 ? '#7a5a8a' : '#d97706' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid #e0ede0' }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '4px' }}>{s.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0ede0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>Accuracy Over Time</h3>
          {scores.length > 0 ? <Line data={accuracyData} options={lineOpts} /> : <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Play some games to see your accuracy trend</p>}
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0ede0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 12px' }}>Mood Trend</h3>
          <div style={{ position: 'relative', height: '260px' }}>
            {moods.length > 0 ? <Line data={moodData} options={moodOpts} /> : <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No mood data yet — check in from the home page</p>}
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #e0ede0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>Performance by Game</h3>
        {Object.keys(gameStats).length > 0 ? <Bar data={perfData} options={barOpts} /> : <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Play some games to see performance</p>}
      </div>

      {/* Story Quiz */}
      {storyQuizzes.length > 0 && (
        <>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #e0ede0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 12px' }}>Story Quiz Scores</h3>
            <div style={{ position: 'relative', height: '260px' }}>
              <Line data={storyQuizData} options={storyQuizOpts} />
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #e0ede0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>Story Quiz History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {storyQuizzes.map((q, i) => {
                const d = new Date(q.date || q.completedAt || q.createdAt);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', background: '#f8f8fc' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#1a2e1a', fontSize: '14px' }}>{q.storyTitle || q.storyId?.title || 'Story Quiz'}</span>
                      <span style={{ color: '#888', fontSize: '12px', marginLeft: '12px' }}>{isNaN(d) ? '' : d.toLocaleDateString()}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: q.accuracy >= 70 ? '#7a5a8a' : '#d97706', fontSize: '14px' }}>{q.accuracy}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0ede0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 16px' }}>Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Total Games Played', value: scores.length },
            { label: 'Average Accuracy', value: `${avgAccuracy}%` },
            scores.length > 0 && { label: 'Latest Accuracy', value: `${scores[scores.length - 1]?.accuracy ?? 0}%`, warn: scores[scores.length - 1]?.accuracy < 40 },
            latestMood && { label: 'Current Mood', value: ['', 'Bad', 'Low', 'Okay', 'Good', 'Great'][latestMood] },
            storyQuizzes.length > 0 && { label: 'Story Quizzes Completed', value: storyQuizzes.length, color: '#7a5a8a' },
            storyQuizzes.length > 0 && { label: 'Average Quiz Score', value: `${avgQuizAccuracy}%`, color: '#7a5a8a' },
          ].filter(Boolean).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: '#f8fdf8' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>{s.label}</span>
              <span style={{ fontWeight: '700', color: s.warn ? '#ef4444' : s.color || '#2a5a2a' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
