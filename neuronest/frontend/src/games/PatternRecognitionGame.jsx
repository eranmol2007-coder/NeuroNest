import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { queueOrSend } from '../services/offlineSync';
import Card from '../components/ui/Card.jsx';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const ICONS = ['🏮', '🎋', '🥁', '🌸', '🦚', '🍵', '🌾', '🪈'];

// Pattern types for cognitive training
const PATTERN_TYPES = {
  easy: ['simple-repeat', 'alternating'],     // AB AB, AAB AAB
  medium: ['sequence', 'growing'],            // ABC ABC, A AB ABC
  hard: ['complex', 'mirrored']               // ABCD ABCD, ABC CBA
};

const ROUNDS_COUNT = { easy: 5, medium: 6, hard: 8 };

// Generate a pattern based on difficulty
function generatePattern(difficulty) {
  const types = PATTERN_TYPES[difficulty];
  const patternType = types[Math.floor(Math.random() * types.length)];
  
  const getRandomIcons = (count) => {
    const shuffled = [...ICONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  let pattern = [];
  let correctAnswer;

  switch (patternType) {
    case 'simple-repeat': // AB AB AB _
      {
        const [a, b] = getRandomIcons(2);
        pattern = [a, b, a, b, a, b];
        correctAnswer = a;
      }
      break;
    
    case 'alternating': // AAB AAB AAB _
      {
        const [a, b] = getRandomIcons(2);
        pattern = [a, a, b, a, a, b, a, a, b];
        correctAnswer = a;
      }
      break;
    
    case 'sequence': // ABC ABC ABC _
      {
        const [a, b, c] = getRandomIcons(3);
        pattern = [a, b, c, a, b, c, a, b, c];
        correctAnswer = a;
      }
      break;
    
    case 'growing': // A AB ABC _
      {
        const [a, b, c] = getRandomIcons(3);
        pattern = [a, a, b, a, b, c];
        correctAnswer = a;
      }
      break;
    
    case 'complex': // ABCD ABCD _
      {
        const [a, b, c, d] = getRandomIcons(4);
        pattern = [a, b, c, d, a, b, c, d];
        correctAnswer = a;
      }
      break;
    
    case 'mirrored': // ABC CBA ABC _
      {
        const [a, b, c] = getRandomIcons(3);
        pattern = [a, b, c, c, b, a, a, b, c];
        correctAnswer = c;
      }
      break;
    
    default:
      const [a, b] = getRandomIcons(2);
      pattern = [a, b, a, b];
      correctAnswer = a;
  }

  // Generate 3 wrong options
  const wrongOptions = ICONS.filter(icon => icon !== correctAnswer && !pattern.includes(icon)).slice(0, 3);
  const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

  return { pattern, correctAnswer, options: allOptions, patternType };
}

export default function PatternRecognitionGame() {
  const { patient, updateLocalPatient } = usePatient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(patient?.currentDifficulty || 'easy');
  const [started, setStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const totalRounds = ROUNDS_COUNT[difficulty];

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  const resetGame = () => {
    setStarted(false);
    setCurrentRound(0);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFinished(false);
    setResult(null);
    setCurrentPattern(null);
  };

  const startGame = () => {
    setStarted(true);
    setStartTime(Date.now());
    setCurrentRound(1);
    setCurrentPattern(generatePattern(difficulty));
  };

  const handleAnswerClick = (answer) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentPattern.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentRound >= totalRounds) {
        setFinished(true);
      } else {
        setCurrentRound(prev => prev + 1);
        setCurrentPattern(generatePattern(difficulty));
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }, 1500);
  };

  useEffect(() => {
    if (!finished || result) return;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.round((correctCount / totalRounds) * 100);
    
    (async () => {
      setSubmitting(true);
      const res = await queueOrSend('POST', '/api/scores', { 
        patientId: patient._id, 
        gameType: 'patternRecognition', 
        accuracy, 
        timeTaken, 
        difficulty 
      }, 'Pattern Recognition');
      
      if (res.data?.data?.adaptiveDifficulty?.nextDifficulty) {
        updateLocalPatient({ currentDifficulty: res.data.data.adaptiveDifficulty.nextDifficulty });
      }
      
      setResult({ 
        accuracy, 
        timeTaken, 
        correctCount, 
        offline: res.offline, 
        reason: res.data?.data?.adaptiveDifficulty?.reason 
      });
      setSubmitting(false);
    })();
  }, [finished, result, correctCount, totalRounds, startTime, patient, difficulty, updateLocalPatient]);

  return (
    <div className="modern-page" style={{ position: 'relative', background: 'transparent', minHeight: '100vh' }}>
      <Animated3DBackground />
      
      <div className="page-container" style={{ paddingTop: '40px', position: 'relative', zIndex: 1 }}>
        <div className="max-w-3xl mx-auto px-8 py-14 animate-fade-up">
          <div className="flex items-center justify-between mb-8">
            <h1 className="heading-page" style={{ color: '#2d5016' }}>{t('games.pattern_recognition')}</h1>
            <div className="flex items-center gap-3">
              <select 
                value={difficulty} 
                onChange={(e) => handleDifficultyChange(e.target.value)}
                disabled={started && !finished}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(145deg, rgba(240, 250, 240, 0.96) 0%, rgba(232, 248, 232, 0.92) 100%)',
                  border: '1.5px solid rgba(122, 170, 122, 0.45)',
                  color: '#2d5016',
                  backdropFilter: 'blur(20px)',
                  cursor: started && !finished ? 'not-allowed' : 'pointer',
                  opacity: started && !finished ? 0.6 : 1
                }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Start Screen */}
          {!started && (
            <Card className="text-center py-10" hover={false}>
              <p className="text-lg mb-4" style={{ color: '#2d5016', fontWeight: '600' }}>Complete the Pattern</p>
              <p className="text-base mb-8" style={{ color: '#4a5a4a' }}>
                Look at the pattern and choose what comes next
              </p>
              <button onClick={startGame} className="btn-gold">{t('game_common.start_game')}</button>
            </Card>
          )}

          {/* Game Screen */}
          {started && !finished && currentPattern && (
            <div className="space-y-8">
              <div className="text-center mb-6">
                <p className="text-sm font-semibold mb-2" style={{ color: '#4a5a4a' }}>
                  Question {currentRound} of {totalRounds}
                </p>
                <p className="text-lg font-bold" style={{ color: '#2d5016' }}>
                  What comes next?
                </p>
              </div>

              {/* Pattern Display */}
              <div className="glass-card p-8 rounded-3xl" style={{ position: 'relative' }}>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {currentPattern.pattern.map((icon, idx) => (
                    <div 
                      key={idx}
                      className="w-16 h-16 flex items-center justify-center text-3xl rounded-2xl transition-all"
                      style={{
                        background: 'linear-gradient(145deg, rgba(240, 250, 240, 0.8) 0%, rgba(220, 245, 220, 0.8) 100%)',
                        border: '2px solid rgba(122, 170, 122, 0.3)',
                        boxShadow: '0 4px 12px rgba(90, 154, 90, 0.15)'
                      }}
                    >
                      {icon}
                    </div>
                  ))}
                  <div 
                    className="w-16 h-16 flex items-center justify-center text-3xl rounded-2xl"
                    style={{
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.4) 0%, rgba(240, 240, 240, 0.4) 100%)',
                      border: '2px dashed rgba(122, 170, 122, 0.5)',
                      fontSize: '2rem',
                      color: '#5a9a5a'
                    }}
                  >
                    ?
                  </div>
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                {currentPattern.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = showFeedback && option === currentPattern.correctAnswer;
                  const isWrongSelection = showFeedback && isSelected && !isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerClick(option)}
                      disabled={showFeedback}
                      className="aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 hover:scale-105"
                      style={{
                        background: isCorrectAnswer 
                          ? 'linear-gradient(145deg, rgba(90, 200, 90, 0.9) 0%, rgba(60, 170, 60, 0.9) 100%)'
                          : isWrongSelection
                          ? 'linear-gradient(145deg, rgba(220, 80, 80, 0.9) 0%, rgba(200, 60, 60, 0.9) 100%)'
                          : 'linear-gradient(145deg, rgba(240, 250, 240, 0.96) 0%, rgba(232, 248, 232, 0.92) 100%)',
                        border: isCorrectAnswer || isWrongSelection
                          ? '2px solid rgba(255, 255, 255, 0.8)'
                          : '2px solid rgba(122, 170, 122, 0.4)',
                        boxShadow: isCorrectAnswer 
                          ? '0 0 20px rgba(90, 200, 90, 0.6), 0 8px 25px rgba(60, 170, 60, 0.4)'
                          : isWrongSelection
                          ? '0 0 20px rgba(220, 80, 80, 0.6)'
                          : '0 4px 15px rgba(90, 154, 90, 0.2)',
                        cursor: showFeedback ? 'not-allowed' : 'pointer',
                        transform: isCorrectAnswer || isWrongSelection ? 'scale(1.05)' : 'scale(1)',
                        pointerEvents: showFeedback ? 'none' : 'auto'
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Message */}
              {showFeedback && (
                <div 
                  className="text-center py-4 px-6 rounded-2xl font-semibold text-lg animate-fade-up"
                  style={{
                    background: isCorrect 
                      ? 'linear-gradient(145deg, rgba(90, 200, 90, 0.2) 0%, rgba(60, 170, 60, 0.2) 100%)'
                      : 'linear-gradient(145deg, rgba(220, 80, 80, 0.2) 0%, rgba(200, 60, 60, 0.2) 100%)',
                    color: isCorrect ? '#2d5016' : '#8b3a3a',
                    border: `2px solid ${isCorrect ? 'rgba(90, 200, 90, 0.4)' : 'rgba(220, 80, 80, 0.4)'}`
                  }}
                >
                  {isCorrect ? '✓ Correct! Well done!' : '✗ Not quite, but keep trying!'}
                </div>
              )}
            </div>
          )}

          {/* Results Screen */}
          {finished && (
            <Card className="text-center animate-scale-in" hover={false}>
              {submitting ? (
                <div className="py-10">
                  <div className="w-8 h-8 mx-auto border-2 border-brand-500/20 border-t-brand-400 rounded-full animate-spin-slow" />
                </div>
              ) : result && (
                <div className="space-y-6 py-4">
                  <p className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                    {t('game_common.well_done')}
                  </p>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-3xl font-bold" style={{ color: '#5a9a5a' }}>
                        {result.correctCount}/{totalRounds}
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
                      background: 'rgba(240, 250, 240, 0.5)' 
                    }}>
                      {result.reason}
                    </p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => {
                        resetGame();
                        startGame();
                      }} 
                      className="btn-gold flex-1"
                    >
                      {t('game_common.play_again')}
                    </button>
                    <button 
                      onClick={() => navigate('/games')} 
                      className="btn-glass flex-1"
                    >
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


