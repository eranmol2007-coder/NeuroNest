import React, { useState } from 'react';
import { personalStoriesApi } from '../services/api';
import { usePatient } from '../context/PatientContext.jsx';

export default function StoryQuiz({ story, onComplete, onBack }) {
  const { patient } = usePatient();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = story.questions || [];
  const question = questions[currentQ];

  const handleSelect = (idx) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, { selectedAnswer: selected }];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (allAnswers) => {
    setSubmitting(true);
    try {
      const res = await personalStoriesApi.submitQuiz({
        storyId: story._id,
        patientId: patient?._id,
        answers: allAnswers,
      });
      setResult(res.data);
      setSubmitted(true);
    } catch {
      setResult({
        score: allAnswers.filter((a, i) => a.selectedAnswer === questions[i]?.correctAnswer).length,
        totalQuestions: questions.length,
        accuracy: Math.round(
          (allAnswers.filter((a, i) => a.selectedAnswer === questions[i]?.correctAnswer).length / questions.length) * 100
        ),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && result) {
    return (
      <div className="reminiscence-mood-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>
          {result.accuracy >= 80 ? '🌟' : result.accuracy >= 50 ? '👍' : '💪'}
        </span>
        <h2 style={{ color: '#2d5a27', marginBottom: '8px' }}>Quiz Complete!</h2>
        <p style={{ color: '#555', marginBottom: '24px', fontSize: '16px' }}>
          You answered {result.score} out of {result.totalQuestions} correctly
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#2d5a27' }}>{result.accuracy}%</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Accuracy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#2d5a27' }}>{result.score}/{result.totalQuestions}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Score</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-green" onClick={onBack}>Back to Stories</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="reminiscence-mood-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
        <h2 style={{ color: '#2d5a27', marginBottom: '12px' }}>No Questions Yet</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>The caregiver hasn't added any questions for this story yet.</p>
        <button className="btn-green" onClick={onBack}>Back to Stories</button>
      </div>
    );
  }

  return (
    <div className="reminiscence-mood-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn-glass" onClick={onBack} style={{ fontSize: '13px', padding: '6px 12px' }}>
          ← Back
        </button>
        <span style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>
          Question {currentQ + 1} / {questions.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {questions.map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1, height: '6px', borderRadius: '3px',
              background: idx < currentQ ? '#2d5a27' : idx === currentQ ? '#5a9a5a' : '#e0ede0',
            }}
          />
        ))}
      </div>

      <h2 style={{ color: '#2d5a27', marginBottom: '24px', fontSize: '20px', lineHeight: 1.4 }}>
        {question.question}
      </h2>

      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            style={{
              padding: '14px 18px', borderRadius: '12px',
              border: selected === idx ? '2px solid #2d5a27' : '2px solid #c8dcc8',
              background: selected === idx ? '#e8f5e8' : '#fff',
              cursor: 'pointer', textAlign: 'left', fontSize: '15px',
              color: '#1a1a1a', transition: 'all 0.2s',
              fontWeight: selected === idx ? 600 : 400,
            }}
          >
            <span style={{ marginRight: '10px', color: '#999' }}>{String.fromCharCode(65 + idx)}.</span>
            {opt}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn-green"
          onClick={handleNext}
          disabled={selected === null || submitting}
          style={{ opacity: selected === null ? 0.5 : 1 }}
        >
          {submitting ? 'Submitting...' : currentQ < questions.length - 1 ? 'Next →' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
