import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { queueOrSend } from '../services/offlineSync';
import Card from '../components/ui/Card.jsx';

const ICON_SETS = {
  easy: ['🪈', '🎋', '🌾', '🏮'],
  medium: ['🪈', '🎋', '🌾', '🏮', '🥁', '🌸'],
  hard: ['🪈', '🎋', '🌾', '🏮', '🥁', '🌸', '🦚', '🍵'],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function buildDeck(d) {
  const icons = ICON_SETS[d] || ICON_SETS.easy;
  return shuffle(icons.flatMap((icon, i) => [{ id: `${i}-a`, icon, matchKey: icon }, { id: `${i}-b`, icon, matchKey: icon }]));
}

export default function MemoryMatchGame() {
  const { patient, updateLocalPatient } = usePatient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(patient?.currentDifficulty || 'easy');
  const [deck, setDeck] = useState(() => buildDeck(difficulty));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState(false);

  const totalPairs = deck.length / 2;

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setDeck(buildDeck(newDifficulty));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setStartTime(Date.now());
    setFinished(false);
    setResult(null);
  };

  const handleCardClick = useCallback((index) => {
    if (busy || finished || flipped.includes(index) || matched.has(index) || flipped.length === 2) return;
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [i1, i2] = next;
      if (deck[i1].matchKey === deck[i2].matchKey) {
        setMatched((prev) => new Set(prev).add(i1).add(i2));
        setFlipped([]);
      } else {
        setBusy(true);
        setTimeout(() => { setFlipped([]); setBusy(false); }, 800);
      }
    }
  }, [busy, finished, flipped, matched, deck]);

  useEffect(() => { if (matched.size > 0 && matched.size === deck.length) setFinished(true); }, [matched, deck.length]);

  useEffect(() => {
    if (!finished || result) return;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.max(0, Math.min(100, Math.round((totalPairs / Math.max(moves, totalPairs)) * 100)));
    (async () => {
      setSubmitting(true);
      const res = await queueOrSend('POST', '/api/scores', { patientId: patient._id, gameType: 'memoryMatch', accuracy, timeTaken, difficulty }, 'Memory Match');
      if (res.data?.data?.adaptiveDifficulty?.nextDifficulty) updateLocalPatient({ currentDifficulty: res.data.data.adaptiveDifficulty.nextDifficulty });
      setResult({ accuracy, timeTaken, moves, offline: res.offline, reason: res.data?.data?.adaptiveDifficulty?.reason });
      setSubmitting(false);
    })();
  }, [finished]);

  const gridCols = deck.length <= 8 ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-4';

  return (
    <div className="max-w-2xl mx-auto px-8 py-14 animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-page">{t('games.memory_match')}</h1>
        <div className="flex items-center gap-3">
          <select 
            value={difficulty} 
            onChange={(e) => handleDifficultyChange(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(145deg, rgba(240, 250, 240, 0.96) 0%, rgba(232, 248, 232, 0.92) 100%)',
              border: '1.5px solid rgba(122, 170, 122, 0.45)',
              color: '#2d5016',
              backdropFilter: 'blur(20px)',
              cursor: 'pointer'
            }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      <p className="text-caption mb-8">Tap cards to find pairs · <span className="text-white/50">{moves} moves</span></p>

      {!finished && (
        <div className={`grid ${gridCols} gap-3`}>
          {deck.map((card, index) => {
            const isFaceUp = flipped.includes(index) || matched.has(index);
            return (
              <button key={card.id} onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-2xl text-2xl sm:text-3xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                  isFaceUp
                    ? 'glass-strong border-brand-500/20 scale-[0.96]'
                    : 'hover:scale-105'
                }`}
                style={!isFaceUp ? {
                  background: 'linear-gradient(145deg, #1a4d1a 0%, #2d5016 30%, #1a3d0f 60%, #0d2608 100%)',
                  border: '1.5px solid rgba(90, 154, 90, 0.5)',
                  boxShadow: '0 8px 32px rgba(29, 77, 26, 0.4), inset 0 1px 0 rgba(160, 210, 160, 0.2)',
                } : {}}>
                {isFaceUp ? (
                  card.icon
                ) : (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {/* Geometric crystal pattern background */}
                    <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                      {/* Central diamond cluster */}
                      <polygon points="100,40 130,70 100,100 70,70" fill="rgba(90, 200, 90, 0.3)" stroke="rgba(160, 255, 160, 0.6)" strokeWidth="1"/>
                      <polygon points="100,100 130,130 100,160 70,130" fill="rgba(60, 160, 60, 0.4)" stroke="rgba(120, 220, 120, 0.5)" strokeWidth="1"/>
                      <polygon points="40,100 70,70 100,100 70,130" fill="rgba(45, 140, 45, 0.35)" stroke="rgba(140, 240, 140, 0.5)" strokeWidth="1"/>
                      <polygon points="100,100 130,70 160,100 130,130" fill="rgba(70, 180, 70, 0.35)" stroke="rgba(150, 250, 150, 0.5)" strokeWidth="1"/>
                      
                      {/* Corner crystals */}
                      <polygon points="20,20 40,30 30,50 10,40" fill="rgba(50, 150, 50, 0.25)" stroke="rgba(130, 230, 130, 0.4)" strokeWidth="0.5"/>
                      <polygon points="180,20 190,40 170,50 160,30" fill="rgba(50, 150, 50, 0.25)" stroke="rgba(130, 230, 130, 0.4)" strokeWidth="0.5"/>
                      <polygon points="20,180 30,170 40,190 10,200" fill="rgba(50, 150, 50, 0.25)" stroke="rgba(130, 230, 130, 0.4)" strokeWidth="0.5"/>
                      <polygon points="180,180 190,190 170,200 160,180" fill="rgba(50, 150, 50, 0.25)" stroke="rgba(130, 230, 130, 0.4)" strokeWidth="0.5"/>
                      
                      {/* Accent lines */}
                      <line x1="100" y1="40" x2="100" y2="160" stroke="rgba(160, 255, 160, 0.3)" strokeWidth="0.5"/>
                      <line x1="40" y1="100" x2="160" y2="100" stroke="rgba(160, 255, 160, 0.3)" strokeWidth="0.5"/>
                      <line x1="70" y1="70" x2="130" y2="130" stroke="rgba(140, 240, 140, 0.25)" strokeWidth="0.5"/>
                      <line x1="130" y1="70" x2="70" y2="130" stroke="rgba(140, 240, 140, 0.25)" strokeWidth="0.5"/>
                    </svg>
                    
                    {/* Glowing center icon */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="absolute w-12 h-12 rounded-full" style={{
                        background: 'radial-gradient(circle, rgba(90, 200, 90, 0.3) 0%, transparent 70%)',
                        filter: 'blur(8px)'
                      }}></div>
                      <span style={{
                        fontSize: '2.5rem',
                        filter: 'drop-shadow(0 0 8px rgba(160, 255, 160, 0.8)) drop-shadow(0 0 16px rgba(90, 200, 90, 0.4))',
                      }}>🧠</span>
                    </div>
                    
                    {/* Corner accent dots */}
                    <div className="absolute top-3 left-3 w-2 h-2 rounded-full" style={{ 
                      background: 'rgba(160, 255, 160, 0.6)',
                      boxShadow: '0 0 6px rgba(160, 255, 160, 0.8)'
                    }}></div>
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full" style={{ 
                      background: 'rgba(160, 255, 160, 0.6)',
                      boxShadow: '0 0 6px rgba(160, 255, 160, 0.8)'
                    }}></div>
                    <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full" style={{ 
                      background: 'rgba(160, 255, 160, 0.6)',
                      boxShadow: '0 0 6px rgba(160, 255, 160, 0.8)'
                    }}></div>
                    <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full" style={{ 
                      background: 'rgba(160, 255, 160, 0.6)',
                      boxShadow: '0 0 6px rgba(160, 255, 160, 0.8)'
                    }}></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {finished && (
        <Card className="text-center animate-scale-in" hover={false}>
          {submitting ? (
            <div className="py-10"><div className="w-8 h-8 mx-auto border-2 border-brand-500/20 border-t-brand-400 rounded-full animate-spin-slow" /></div>
          ) : result && (
            <div className="space-y-6 py-4">
              <p className="text-[1.5rem] font-extralight text-white">{t('game_common.well_done')}</p>
              <div className="grid grid-cols-3 gap-6">
                <div><p className="text-3xl font-extralight text-gold-400">{moves}</p><p className="section-label mt-2">{t('game_common.moves')}</p></div>
                <div><p className="text-3xl font-extralight text-gold-400">{result.timeTaken}s</p><p className="section-label mt-2">{t('game_common.time')}</p></div>
                <div><p className="text-3xl font-extralight text-gold-400">{result.accuracy}%</p><p className="section-label mt-2">{t('game_common.score')}</p></div>
              </div>
              {result.reason && <p className="text-[13px] text-white/30 glass rounded-xl px-5 py-3">{result.reason}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setDeck(buildDeck(difficulty)); setFlipped([]); setMatched(new Set()); setMoves(0); setStartTime(Date.now()); setFinished(false); setResult(null); }} className="btn-gold flex-1">{t('game_common.play_again')}</button>
                <button onClick={() => navigate('/games')} className="btn-glass flex-1">{t('game_common.games')}</button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}


