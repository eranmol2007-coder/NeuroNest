import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { queueOrSend } from '../services/offlineSync';
import Card from '../components/ui/Card.jsx';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const ROUTINES = {
  morningTea: { title: 'Making Morning Tea', steps: ['Boil water', 'Add tea leaves', 'Add milk and sugar', 'Let it simmer', 'Strain into a cup'] },
  gettingReady: { title: 'Getting Ready', steps: ['Wake up and stretch', 'Wash your face', 'Brush your teeth', 'Get dressed', 'Comb your hair'] },
  marketVisit: { title: 'Visiting the Market', steps: ['Make a shopping list', 'Take a bag', 'Walk to market', 'Buy vegetables', 'Pay and walk back'] },
  eveningPrayer: { title: 'Evening Prayer', steps: ['Wash your hands', 'Light the lamp', 'Sit quietly', 'Say your prayers', 'Thank the day'] },
};

const STEPS = { easy: 3, medium: 4, hard: 5 };
const SECS = { easy: 12, medium: 9, hard: 6 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function DailyRoutineRecallGame() {
  const { patient, updateLocalPatient } = usePatient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(patient?.currentDifficulty || 'easy');
  const stepsCount = STEPS[difficulty] || 3;
  const memoSecs = SECS[difficulty] || 12;

  const [routineKey, setRoutineKey] = useState(null);
  const activeKey = useMemo(() => {
    if (routineKey) return routineKey;
    const keys = Object.keys(ROUTINES);
    return keys[Math.floor(Math.random() * keys.length)];
  }, [routineKey]);
  const routine = ROUTINES[activeKey];
  const correctOrder = useMemo(() => routine.steps.slice(0, stepsCount), [routine, stepsCount]);

  const [phase, setPhase] = useState('memorize');
  const [secondsLeft, setSecondsLeft] = useState(memoSecs);
  const [shuffledSteps, setShuffledSteps] = useState(() => shuffle(correctOrder));
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    // Reset game with new difficulty
    const keys = Object.keys(ROUTINES);
    const nk = keys[Math.floor(Math.random() * keys.length)];
    const newStepsCount = STEPS[newDifficulty] || 3;
    const newRoutine = ROUTINES[nk];
    setRoutineKey(nk);
    setPhase('memorize');
    setSecondsLeft(SECS[newDifficulty] || 12);
    setSelectedOrder([]);
    setResult(null);
    setSubmitting(false);
    setShuffledSteps(shuffle(newRoutine.steps.slice(0, newStepsCount)));
  };

  useEffect(() => {
    if (phase !== 'memorize') return;
    if (secondsLeft <= 0) { setPhase('order'); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  const handleStepClick = (step) => {
    if (phase !== 'order' || selectedOrder.includes(step)) return;
    const next = [...selectedOrder, step];
    setSelectedOrder(next);
    if (next.length === correctOrder.length) finishGame(next);
  };

  const finishGame = async (finalOrder) => {
    setPhase('finished');
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const correctPositions = finalOrder.filter((step, i) => step === correctOrder[i]).length;
    const accuracy = Math.round((correctPositions / correctOrder.length) * 100);
    setSubmitting(true);
    const res = await queueOrSend('POST', '/api/scores', { patientId: patient._id, gameType: 'dailyRoutineRecall', accuracy, timeTaken, difficulty }, 'Daily Routine');
    if (res.data?.data?.adaptiveDifficulty?.nextDifficulty) updateLocalPatient({ currentDifficulty: res.data.data.adaptiveDifficulty.nextDifficulty });
    setResult({ accuracy, timeTaken, correctPositions, totalSteps: correctOrder.length, offline: res.offline, reason: res.data?.data?.adaptiveDifficulty?.reason });
    setSubmitting(false);
  };

  const playAgain = useCallback(() => {
    const keys = Object.keys(ROUTINES);
    const nk = keys[Math.floor(Math.random() * keys.length)];
    setRoutineKey(nk); setPhase('memorize'); setSecondsLeft(SECS[difficulty] || 12);
    setSelectedOrder([]); setResult(null); setSubmitting(false);
    setShuffledSteps(shuffle(ROUTINES[nk].steps.slice(0, STEPS[difficulty] || 3)));
  }, [difficulty]);

  return (
    <div className="modern-page" style={{ position: 'relative', background: 'transparent', minHeight: '100vh' }}>
      <Animated3DBackground />
      
      <div className="page-container" style={{ paddingTop: '40px', position: 'relative', zIndex: 1 }}>
        <div className="max-w-lg mx-auto px-8 py-14 animate-fade-up">
          <div className="flex items-center justify-between mb-8">
            <h1 className="heading-page" style={{ color: '#2d5016' }}>{t('games.daily_routine')}</h1>
            <div className="flex items-center gap-3">
              <select 
                value={difficulty} 
                onChange={(e) => handleDifficultyChange(e.target.value)}
                disabled={phase === 'order' || submitting}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(145deg, rgba(240, 250, 240, 0.96) 0%, rgba(232, 248, 232, 0.92) 100%)',
                  border: '1.5px solid rgba(122, 170, 122, 0.45)',
                  color: '#2d5016',
                  backdropFilter: 'blur(20px)',
                  cursor: (phase === 'order' || submitting) ? 'not-allowed' : 'pointer',
                  opacity: (phase === 'order' || submitting) ? 0.6 : 1
                }}
              >
                <option value="easy">Easy (3 steps)</option>
                <option value="medium">Medium (4 steps)</option>
                <option value="hard">Hard (5 steps)</option>
              </select>
            </div>
          </div>
          <p className="text-lg text-center mb-8 font-semibold" style={{ color: '#2d5016' }}>{routine.title}</p>

          {phase === 'memorize' && (
            <Card hover={false} style={{ position: 'relative', zIndex: 2 }}>
              <p className="text-base text-center mb-6" style={{ color: '#4a5a4a' }}>
                {t('game_common.memorize')} · <span style={{ color: '#5a9a5a', fontWeight: '600', fontSize: '1.1rem' }}>{secondsLeft}s</span>
              </p>
              <ol className="space-y-3">
                {correctOrder.map((step, i) => (
                  <li key={step} className="flex items-center gap-4 px-5 py-4 rounded-xl" style={{
                    background: 'linear-gradient(145deg, rgba(240, 250, 240, 0.8) 0%, rgba(220, 245, 220, 0.8) 100%)',
                    border: '1.5px solid rgba(122, 170, 122, 0.3)',
                    boxShadow: '0 2px 8px rgba(90, 154, 90, 0.1)'
                  }}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{
                      background: 'linear-gradient(145deg, rgba(90, 154, 90, 0.3) 0%, rgba(60, 130, 60, 0.3) 100%)',
                      color: '#2d5016',
                      border: '1px solid rgba(90, 154, 90, 0.4)'
                    }}>{i + 1}</span>
                    <span className="text-base" style={{ color: '#1a1a1a', fontWeight: '500' }}>{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {phase === 'order' && (
            <Card hover={false} style={{ position: 'relative', zIndex: 2 }}>
              <p className="text-base text-center mb-6" style={{ color: '#4a5a4a' }}>
                {t('game_common.your_turn')} ({selectedOrder.length}/{correctOrder.length})
              </p>
              <div className="space-y-3">
                {shuffledSteps.map((step) => {
                  const isSelected = selectedOrder.includes(step);
                  return (
                    <button key={step} onClick={() => handleStepClick(step)} disabled={isSelected}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left text-base transition-all duration-300 ${
                        isSelected ? '' : 'hover:scale-[1.02]'
                      }`}
                      style={{
                        background: isSelected
                          ? 'linear-gradient(145deg, rgba(90, 200, 90, 0.2) 0%, rgba(60, 170, 60, 0.2) 100%)'
                          : 'linear-gradient(145deg, rgba(240, 250, 240, 0.8) 0%, rgba(220, 245, 220, 0.8) 100%)',
                        border: isSelected
                          ? '2px solid rgba(90, 154, 90, 0.6)'
                          : '1.5px solid rgba(122, 170, 122, 0.3)',
                        color: isSelected ? '#2d5016' : '#4a5a4a',
                        fontWeight: isSelected ? '600' : '500',
                        cursor: isSelected ? 'not-allowed' : 'pointer',
                        boxShadow: isSelected 
                          ? '0 0 15px rgba(90, 200, 90, 0.3), 0 4px 12px rgba(60, 170, 60, 0.2)'
                          : '0 2px 8px rgba(90, 154, 90, 0.1)',
                        opacity: isSelected ? 1 : 0.9
                      }}>
                      {isSelected && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
                          background: 'linear-gradient(145deg, rgba(90, 154, 90, 0.4) 0%, rgba(60, 130, 60, 0.4) 100%)',
                          color: '#2d5016',
                          border: '1px solid rgba(90, 154, 90, 0.5)'
                        }}>
                          {selectedOrder.indexOf(step) + 1}
                        </span>
                      )}
                      {step}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {phase === 'finished' && (
            <Card className="text-center animate-scale-in" hover={false} style={{ position: 'relative', zIndex: 2 }}>
              {submitting ? (
                <div className="py-10">
                  <div className="w-8 h-8 mx-auto border-2 rounded-full animate-spin-slow" style={{
                    borderColor: 'rgba(122, 170, 122, 0.3)',
                    borderTopColor: '#5a9a5a'
                  }} />
                </div>
              ) : result && (
                <div className="space-y-6 py-4">
                  <p className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                    {t('game_common.well_done')}
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-3xl font-bold" style={{ color: '#5a9a5a' }}>
                        {result.correctPositions}/{result.totalSteps}
                      </p>
                      <p className="text-sm mt-2" style={{ color: '#4a5a4a' }}>
                        {t('game_common.correct')}
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold" style={{ color: '#5a9a5a' }}>
                        {result.timeTaken}s
                      </p>
                      <p className="text-sm mt-2" style={{ color: '#4a5a4a' }}>
                        {t('game_common.time')}
                      </p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold" style={{ color: '#5a9a5a' }}>
                        {result.accuracy}%
                      </p>
                      <p className="text-sm mt-2" style={{ color: '#4a5a4a' }}>
                        {t('game_common.score')}
                      </p>
                    </div>
                  </div>
                  {result.reason && (
                    <p className="text-sm px-5 py-3 rounded-xl" style={{ 
                      color: '#4a5a4a',
                      background: 'rgba(240, 250, 240, 0.6)',
                      border: '1px solid rgba(122, 170, 122, 0.3)'
                    }}>
                      {result.reason}
                    </p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button onClick={playAgain} className="btn-gold flex-1">
                      {t('game_common.play_again')}
                    </button>
                    <button onClick={() => navigate('/games')} className="btn-glass flex-1">
                      {t('game_common.games')}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


