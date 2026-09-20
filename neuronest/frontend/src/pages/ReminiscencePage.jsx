import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { personalStoriesApi } from '../services/api';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';
import StoryQuiz from '../components/features/StoryQuiz.jsx';

const LANG_BCP47 = {
  English: 'en-US', Assamese: 'as-IN', Bengali: 'bn-IN', Hindi: 'hi-IN',
  Khasi: 'en-IN', Mizo: 'en-IN', Nagamese: 'bn-IN', Manipuri: 'mni-IN', Arunachali: 'en-IN',
};
const VOICE_OPTIONS = Object.entries(LANG_BCP47).map(([label, lang]) => ({ lang, label }));

const DEFAULT_STORY_IMAGES = {
  childhood: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  home: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  school: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
  family: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&q=80',
  job: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=80',
  work: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=80',
  wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
  music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
  garden: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
  kitchen: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  book: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80',
  festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
  celebration: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
};

function getStoryImage(story) {
  if (story.imageUrl) return story.imageUrl;
  const title = (story.title || '').toLowerCase();
  for (const [key, url] of Object.entries(DEFAULT_STORY_IMAGES)) {
    if (title.includes(key)) return url;
  }
  return '';
}

export default function ReminiscencePage() {
  const { patient } = usePatient();
  const { lang } = useTranslation();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceLang, setVoiceLang] = useState(() => LANG_BCP47[patient?.language || lang] || 'en-US');
  const [fontSize, setFontSize] = useState('medium');
  const [showQuiz, setShowQuiz] = useState(false);
  const [autoQuestions, setAutoQuestions] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const textRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = patient?._id ? await personalStoriesApi.getForPatient(patient._id) : { data: [] };
        setStories(res.data || []);
      } catch { setStories([]); } finally { setLoading(false); }
    }
    load();
  }, [patient]);

  const stopSpeech = useCallback(() => { if (synthRef.current) synthRef.current.cancel(); setIsPlaying(false); }, []);

  const speakText = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 0.85;
    const voices = synthRef.current.getVoices();
    const matching = voices.find(v => v.lang === voiceLang);
    if (matching) utterance.voice = matching;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  }, [voiceLang]);

  const handleBack = () => {
    stopSpeech();
    setSelectedStory(null); setChapterIdx(0); setShowQuiz(false);
    setAutoQuestions(null);
  };

  const loadAutoQuiz = async (story) => {
    setQuizLoading(true);
    try { const res = await personalStoriesApi.generateQuiz(story._id); setAutoQuestions(res.data || []); }
    catch { setAutoQuestions([]); }
    finally { setQuizLoading(false); setShowQuiz(true); }
  };

  useEffect(() => { return () => stopSpeech(); }, [stopSpeech]);
  useEffect(() => { if (textRef.current) textRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [chapterIdx]);

  const fontSizeMap = { small: '0.95rem', medium: '1.1rem', large: '1.3rem' };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7f0, #e8f4e8)' }}>
      <Animated3DBackground />
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', margin: '0 auto', border: '3px solid #c8dcc8', borderTopColor: '#3d7a3d', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#666', marginTop: '16px' }}>Loading stories...</p>
      </div>
    </div>
  );

  // Quiz view
  if (showQuiz && selectedStory) {
    const questionsToShow = autoQuestions || [];
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7f0, #e8f4e8)' }}>
        <Animated3DBackground />
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '100px 24px 60px', position: 'relative', zIndex: 1 }}>
          {quizLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ width: '32px', height: '32px', margin: '0 auto', border: '3px solid #c8dcc8', borderTopColor: '#3d7a3d', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ color: '#666', marginTop: '16px' }}>Generating questions...</p>
            </div>
          ) : (
            <StoryQuiz story={{ ...selectedStory, questions: questionsToShow, _autoGenerated: true }} onBack={handleBack} onComplete={() => handleBack()} />
          )}
        </div>
      </div>
    );
  }

  // Chapter reading view
  if (selectedStory) {
    const chapter = selectedStory.chapters?.[chapterIdx];
    const total = selectedStory.chapters?.length || 0;

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7f0, #e8f4e8)' }}>
        <Animated3DBackground />
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '100px 24px 60px', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button onClick={handleBack} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #c8dcc8', background: '#fff', color: '#2d5a27', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>← Back to Stories</button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #c8dcc8', background: '#fff', fontSize: '13px' }}>
                {VOICE_OPTIONS.map(v => <option key={v.lang} value={v.lang}>{v.label}</option>)}
              </select>
              <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #c8dcc8', background: '#fff', fontSize: '13px' }}>
                <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Story title */}
          <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e0ede0' }}>
            {getStoryImage(selectedStory) ? (
              <div style={{ height: '160px', position: 'relative' }}>
                <img src={getStoryImage(selectedStory)} alt={selectedStory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '20px 24px 16px' }}>
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '4px' }}>{selectedStory.icon || '📖'}</span>
                  <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 }}>{selectedStory.title}</h1>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>{selectedStory.icon || '📖'}</span>
                <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a2e1a', margin: 0 }}>{selectedStory.title}</h1>
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
            {selectedStory.chapters?.map((_, idx) => (
              <button key={idx} onClick={() => { stopSpeech(); setChapterIdx(idx); }}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: idx === chapterIdx ? '2px solid #3d7a3d' : '1px solid #c8dcc8', background: idx === chapterIdx ? '#3d7a3d' : '#fff', color: idx === chapterIdx ? '#fff' : '#666', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Chapter card */}
          {chapter && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', marginBottom: '20px', border: '1px solid #e0ede0' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>Chapter {chapterIdx + 1} of {total}</p>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a2e1a', marginBottom: '16px' }}>{chapter.title}</h2>
              {chapter.text ? (
                <p ref={textRef} style={{ fontSize: fontSizeMap[fontSize], lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>{chapter.text}</p>
              ) : (
                <p ref={textRef} style={{ fontSize: fontSizeMap[fontSize], lineHeight: 1.8, color: '#999', fontStyle: 'italic' }}>No text available for this chapter.</p>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => { if (isPlaying) stopSpeech(); else if (chapter.text) speakText(chapter.text); }}
                  style={{ padding: '12px 24px', borderRadius: '12px', border: isPlaying ? '2px solid #ef4444' : '2px solid #3d7a3d', background: isPlaying ? '#fef2f2' : '#f0f7f0', color: isPlaying ? '#ef4444' : '#2d5a27', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  {isPlaying ? '⏸ Pause' : '🔊 Read Aloud'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => { stopSpeech(); setChapterIdx(prev => prev - 1); }} disabled={chapterIdx === 0}
              style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #c8dcc8', background: chapterIdx === 0 ? '#f5f5f5' : '#fff', color: chapterIdx === 0 ? '#bbb' : '#2d5a27', fontSize: '14px', fontWeight: '600', cursor: chapterIdx === 0 ? 'not-allowed' : 'pointer' }}>
              ← Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#666', fontWeight: '600' }}>{chapterIdx + 1} / {total}</span>
            <button onClick={() => { stopSpeech(); if (chapterIdx < total - 1) setChapterIdx(prev => prev + 1); else loadAutoQuiz(selectedStory); }}
              style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
              {chapterIdx < total - 1 ? 'Next →' : 'Take Quiz →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stories list
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7f0, #e8f4e8)' }}>
      <Animated3DBackground />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 24px 60px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#3d7a3d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Reminiscence Therapy</p>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a2e1a', margin: 0 }}>My Stories</h1>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Stories created by your caregiver to help you reminisce</p>
        </div>

        {stories.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', border: '1px solid #e0ede0' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📖</p>
            <h3 style={{ color: '#1a2e1a', marginBottom: '8px' }}>No stories yet</h3>
            <p style={{ color: '#888', fontSize: '14px' }}>Your caregiver will create stories for you soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {stories.map(story => (
              <button key={story._id} onClick={() => { setSelectedStory(story); setChapterIdx(0); }}
                style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0ede0', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ height: '140px', background: getStoryImage(story) ? 'none' : `linear-gradient(135deg, ${story.color || '#7a9a7a'}33, ${story.color || '#7a9a7a'}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  {getStoryImage(story) ? (
                    <img src={getStoryImage(story)} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '48px' }}>{story.icon || '📖'}</span>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 4px' }}>{story.title}</h3>
                  <p style={{ fontSize: '13px', color: '#888', margin: '0 0 12px' }}>{story.description || 'A personal story'}</p>
                  <p style={{ fontSize: '12px', color: '#666' }}>{story.chapters?.length || 0} chapters · Auto-generated quiz</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
