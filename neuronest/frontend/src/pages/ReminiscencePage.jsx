import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useTranslation } from '../context/LanguageContext.jsx';
import { reminiscenceApi } from '../services/api';
import { cacheGet, cacheSet } from '../services/offlineSync';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';
import STORY_I18N from '../i18n/reminiscence.js';

const LANG_BCP47 = {
  English: 'en-US',
  Assamese: 'as-IN',
  Bengali: 'bn-IN',
  Hindi: 'hi-IN',
  Khasi: 'en-IN',
  Mizo: 'en-IN',
  Nagamese: 'bn-IN',
  Manipuri: 'mni-IN',
  Nepali: 'ne-NP',
};

const VOICE_OPTIONS = Object.entries(LANG_BCP47).map(([label, lang]) => ({ lang, label }));

const MOODS = [
  { key: 'relaxed', icon: '😌', label: 'Relaxed', color: '#10b981' },
  { key: 'happy', icon: '😊', label: 'Happy', color: '#3b82f6' },
  { key: 'nostalgic', icon: '🥹', label: 'Nostalgic', color: '#f59e0b' },
  { key: 'emotional', icon: '😭', label: 'Emotional', color: '#8b5cf6' },
  { key: 'calm', icon: '🧘', label: 'Calm', color: '#6b7280' },
];

const FALLBACK_THEMES = [
  {
    key: 'childhood_home',
    title: 'My Childhood Home',
    icon: '🏡',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
    color: '#7a9a7a',
    description: 'Relive the warmth and comfort of the home where your journey began.',
    chapterCount: 4,
  },
  {
    key: 'school_days',
    title: 'School Days',
    icon: '🏫',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80',
    color: '#3b82f6',
    description: 'Walk the corridors of your school and revisit the lessons that shaped you.',
    chapterCount: 4,
  },
  {
    key: 'family_festival',
    title: 'Family Festivals',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=900&q=80',
    color: '#f59e0b',
    description: 'Revisit the joy and togetherness of your family celebrations.',
    chapterCount: 4,
  },
  {
    key: 'first_job',
    title: 'First Job Days',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=900&q=80',
    color: '#8b5cf6',
    description: 'Step back into the days when your professional journey first began.',
    chapterCount: 4,
  },
  {
    key: 'wedding_memories',
    title: 'Wedding Memories',
    icon: '💒',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80',
    color: '#ec4899',
    description: 'Relive the magical moments from your special day.',
    chapterCount: 4,
  },
  {
    key: 'nature_walks',
    title: 'Nature Walks',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80',
    color: '#10b981',
    description: 'Walk through the forests and fields that brought you peace.',
    chapterCount: 4,
  },
];

const FALLBACK_STORIES = {
  childhood_home: {
    chapters: [
      { title: 'The Front Door', text: 'The old wooden front door of your family home stands before you. You can almost feel the familiar grain under your fingertips as you reach for the handle. The paint has faded slightly over the years, but it still opens with the same gentle creak you remember. A wave of warmth washes over you as you step inside.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80' },
      { title: 'The Kitchen', text: 'The kitchen is alive with the aroma of your favorite meal. Sunlight streams through the window, casting golden patches on the worn wooden table where the family gathered every evening. You can hear the soft hum of the radio playing old songs, and somewhere nearby, a kettle begins to whistle.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80' },
      { title: 'The Backyard', text: 'You push open the screen door and step into the backyard. The mango tree still stands tall, its branches heavy with fruit. The swing set your father built for you sways gently in the breeze. Grass tickles your bare feet as you walk to your favorite spot under the tree, where the world always felt safe.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&q=80' },
      { title: 'Your Room', text: 'Climbing the familiar stairs, each step creaking in a different tone, you reach your old room. The door is slightly ajar. Inside, everything is just as you left it. The faded posters on the wall, the books stacked on the shelf, the small window overlooking the garden. You sit on the bed and feel the memories flood back.', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80' },
    ],
  },
  school_days: {
    chapters: [
      { title: 'The School Gate', text: 'You stand at the familiar school gate, the iron bars worn smooth by decades of students. The morning sun paints long shadows across the courtyard. You can hear children laughing and the distant sound of a school bell. Your feet remember every crack in the path leading to the main building.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80' },
      { title: 'The Classroom', text: 'You step into your old classroom. The wooden desks are arranged in neat rows, each one carrying the carved initials of generations of students. The blackboard is freshly chalked. You find your seat by the window — the one where you used to watch clouds drift by during math lessons.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80' },
      { title: 'The Playground', text: 'The playground echoes with phantom laughter. You can almost see your younger self running across the field, chasing friends with boundless energy. The old football goalpost still stands at one end. You remember the day you scored the winning goal and the entire school cheered your name.', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80' },
      { title: 'The Library', text: 'The library is a sanctuary of quiet wisdom. Dust motes dance in the shafts of light that filter through tall windows. You run your fingers along the spines of books, each one a door to another world. You remember the first book that changed your life, the one you read cover to cover under this very roof.', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&q=80' },
    ],
  },
  family_festival: {
    chapters: [
      { title: 'Preparing for the Festival', text: 'The house is bustling with preparation. Colorful decorations are being hung, the kitchen is filled with the delicious smell of festive sweets, and laughter echoes from every corner. You remember how everyone had a role — your job was always to string the marigold garlands.', image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=900&q=80' },
      { title: 'The Family Gathering', text: 'The entire family has gathered together. Grandparents sitting on the porch, children running around with sparklers, cousins sharing stories from the year. The house is overflowing with love and warmth. You look around the table and feel a deep sense of gratitude for each person present.', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=80' },
      { title: 'The Evening Celebration', text: 'As the sun sets, the festival truly comes alive. Lamps are lit one by one, casting a warm golden glow across the courtyard. Music fills the air, and people begin to dance. You join in, clapping and swaying to rhythms that your body remembers even if your mind sometimes forgets.', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80' },
      { title: 'The Quiet Moment', text: 'Later in the evening, you find a quiet moment. You sit on the doorstep, looking up at the sky. Fireflies dance in the garden. The distant sound of celebration continues, but here, in this moment, everything is peaceful. You feel the presence of loved ones, both near and far, wrapping you in warmth.', image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80' },
    ],
  },
  first_job: {
    chapters: [
      { title: 'The First Morning', text: 'You wake up extra early, heart pounding with excitement and nervous energy. Your best clothes are laid out on the bed. You eat a quick breakfast, kiss your mother goodbye, and step out into the world with a new sense of purpose. Today is your first day of work.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80' },
      { title: 'The Workplace', text: 'The office building towers before you, impressive and a little intimidating. You push through the glass doors and are greeted by friendly faces. Your desk is small but yours. You organize your things carefully, taking in every detail. This is where your story unfolds.', image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=900&q=80' },
      { title: 'Meeting Colleagues', text: 'Your colleagues welcome you with warm handshakes and genuine smiles. Over chai breaks, you learn their stories — each one on their own unique journey. A kind mentor takes you under their wing, showing you the ropes with patience and encouragement. You feel at home.', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80' },
      { title: 'First Achievement', text: 'At the end of your first week, your supervisor calls you into their office. Instead of criticism, you receive praise. "You have a natural talent for this," they say. Walking home that evening, the setting sun paints the sky in gold, and you carry that warmth inside you like a promise.', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80' },
    ],
  },
  wedding_memories: {
    chapters: [
      { title: 'The Morning Preparations', text: 'The house is alive with excitement. The scent of jasmine and marigold fills every room. Family members bustle about, making final preparations. You sit before a mirror as loving hands help you dress in your finest, each piece of clothing carrying blessings and love.', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80' },
      { title: 'The Procession', text: 'The music starts and the celebration begins. You emerge to the cheers of family and friends. The colors are vibrant — saffron, red, gold — painting a scene of pure joy. Every face you see is beaming with happiness, and the air itself seems to vibrate with love.', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=80' },
      { title: 'The Ceremony', text: 'Time seems to stand still during the ceremony. The sacred flames flicker gently as you take your vows. The world narrows down to just this moment — the promises you make, the circles you walk, the blessings that rain down upon you like flowers from heaven.', image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80' },
      { title: 'The Celebration', text: 'The feast is magnificent. The hall is filled with the aroma of delicacies and the sound of joyful conversations. You move from table to table, embracing loved ones, sharing laughter and tears of joy. Every dish is prepared with love, every smile a blessing.', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900&q=80' },
    ],
  },
  nature_walks: {
    chapters: [
      { title: 'The Forest Path', text: 'The trail begins at the edge of the forest, where tall trees stand like ancient guardians. The canopy above filters sunlight into dancing patterns on the forest floor. Each step on the soft earth feels like a conversation with nature. Birds call to each other in melodies you almost recognize.', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80' },
      { title: 'The River', text: 'You follow the sound of water and find the river winding through a clearing. Its surface sparkles in the afternoon light. You remember coming here as a child, skipping stones across the water and watching them disappear beneath the surface. The river is the same, and so is the peace it brings.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&q=80' },
      { title: 'The Meadow', text: 'The forest opens into a vast meadow blanketed with wildflowers. The fragrance of grass and blossoms fills the air. You lie down and look up at the sky — a canvas of blue interrupted only by lazy, drifting clouds. A butterfly lands on your hand, its wings gentle as a whisper.', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80' },
      { title: 'Sunset Ridge', text: 'As evening approaches, you reach the ridge. The world spreads out before you in every direction. The sun begins its descent, painting the horizon in shades of amber and rose. You sit in silence, feeling the cool breeze on your face. In this moment, everything is exactly as it should be.', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=900&q=80' },
    ],
  },
};

export default function ReminiscencePage() {
  const { patient } = usePatient();
  const { lang } = useTranslation();
  const navigate = useNavigate();

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [storyData, setStoryData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  const [voiceLang, setVoiceLang] = useState(() => LANG_BCP47[patient?.language || lang] || 'en-US');
  const [fontSize, setFontSize] = useState('medium');
  const [completedChapters, setCompletedChapters] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);

  const t = STORY_I18N[lang] || STORY_I18N.English;

  const textRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await reminiscenceApi.getThemes();
        setThemes(res.data);
        await cacheSet('reminiscence_themes', res.data);
      } catch {
        const cached = await cacheGet('reminiscence_themes');
        setThemes(cached || FALLBACK_THEMES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const loadStory = useCallback(async (themeKey) => {
    try {
      const res = await reminiscenceApi.generateStory({
        themeKey,
        patientId: patient?._id,
      });
      setStoryData(res.data);
    } catch {
      const fallback = FALLBACK_STORIES[themeKey];
      if (fallback) {
        const themeInfo = (themes.length ? themes : FALLBACK_THEMES).find(t => t.key === themeKey);
        setStoryData({
          theme: themeKey,
          title: themeInfo?.title || themeKey,
          icon: themeInfo?.icon || '📖',
          chapters: fallback.chapters.map((ch, idx) => ({ ...ch, index: idx })),
        });
      }
    }
    setCurrentChapter(0);
    setCompletedChapters([]);
    setShowCompletion(false);
    setMoodAfter(null);
  }, [patient, themes]);

  const handleThemeSelect = async (theme) => {
    setSelectedTheme(theme);
    await loadStory(theme.key);
  };

  const stopSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  }, []);

  const speakText = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = synthRef.current.getVoices();
    const matching = voices.find(v => v.lang === voiceLang);
    if (matching) utterance.voice = matching;

    utterance.onend = () => {
      setIsPlaying(false);
      if (storyData && currentChapter === storyData.chapters.length - 1) {
        setCompletedChapters(p => [...new Set([...p, currentChapter])]);
        setShowMoodCheck(true);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);

    if (storyData) {
      reminiscenceApi.recordInteraction({
        themeKey: storyData.theme,
        interactionType: 'listen',
        chapterIndex: currentChapter,
      }).catch(() => {});
    }
  }, [voiceLang, storyData, currentChapter]);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopSpeech();
    } else if (storyData?.chapters?.[currentChapter]) {
      speakText(storyData.chapters[currentChapter].text);
    }
  };

  const handleNext = () => {
    stopSpeech();
    if (storyData && currentChapter < storyData.chapters.length - 1) {
      setCompletedChapters(p => [...new Set([...p, currentChapter])]);
      setCurrentChapter(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    stopSpeech();
    if (currentChapter > 0) {
      setCurrentChapter(prev => prev - 1);
    }
  };

  const handleChapterClick = (idx) => {
    stopSpeech();
    setCurrentChapter(idx);
  };

  const handleMoodSubmit = async (mood) => {
    if (!moodBefore) {
      setMoodBefore(mood);
    } else {
      setMoodAfter(mood);
      setShowMoodCheck(false);
      setShowCompletion(true);
      try {
        await reminiscenceApi.recordInteraction({
          themeKey: storyData?.theme,
          interactionType: 'mood_after',
          chapterIndex: currentChapter,
        });
      } catch {}
    }
  };

  const handleBack = () => {
    stopSpeech();
    setSelectedTheme(null);
    setStoryData(null);
    setCurrentChapter(0);
    setCompletedChapters([]);
    setShowCompletion(false);
    setShowMoodCheck(false);
    setMoodBefore(null);
    setMoodAfter(null);
  };

  useEffect(() => {
    return () => stopSpeech();
  }, [stopSpeech]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentChapter]);

  const fontSizeMap = { small: '0.95rem', medium: '1.1rem', large: '1.3rem' };
  const chapter = storyData?.chapters?.[currentChapter];
  const totalChapters = storyData?.chapters?.length || 0;

  if (loading) {
    return (
      <div className="reminiscence-page">
        <Animated3DBackground />
        <div className="reminiscence-container">
          <div className="reminiscence-loading">
            <div className="reminiscence-spinner" />
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTheme) {
    return (
      <div className="reminiscence-page">
        <Animated3DBackground />
        <div className="reminiscence-container">
          <div className="reminiscence-hero">
            <div className="reminiscence-hero-content">
              <p className="home-card-eyebrow">{t.page_title}</p>
              <h1 className="page-title">{t.page_title}</h1>
              <p className="page-subtitle">
                {t.page_subtitle}
              </p>
            </div>
          </div>

          <div className="reminiscence-themes-grid">
            {themes.map((theme) => (
              <button
                key={theme.key}
                className="reminiscence-theme-card"
                onClick={() => handleThemeSelect(theme)}
                style={{ '--theme-color': theme.color }}
              >
                <div className="reminiscence-theme-image">
                  <img
                    src={theme.image}
                    alt={theme.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = `linear-gradient(135deg, ${theme.color}33, ${theme.color}11)`;
                    }}
                  />
                  <div className="reminiscence-theme-overlay" />
                  <span className="reminiscence-theme-icon">{theme.icon}</span>
                </div>
                <div className="reminiscence-theme-body">
                  <h3 className="reminiscence-theme-title">{t.themes?.[theme.key]?.title || theme.title}</h3>
                  <p className="reminiscence-theme-desc">{t.themes?.[theme.key]?.desc || theme.description}</p>
                  <div className="reminiscence-theme-meta">
                    <span>{theme.chapterCount || 4} {t.chapters_label}</span>
                    <span className="reminiscence-theme-arrow">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="reminiscence-page">
        <Animated3DBackground />
        <div className="reminiscence-container">
          <div className="reminiscence-completion">
            <div className="reminiscence-completion-card">
              <span className="reminiscence-completion-icon">{storyData?.icon || '📖'}</span>
              <h2>{t.journey_complete}</h2>
              <p className="reminiscence-completion-text">
                {t.completion_text}
              </p>
              {moodBefore && moodAfter && (
                <div className="reminiscence-mood-summary">
                  <div className="reminiscence-mood-item">
                    <span className="reminiscence-mood-label">{t.mood_before}</span>
                    <span className="reminiscence-mood-value">
                      {MOODS.find(m => m.key === moodBefore)?.icon} {MOODS.find(m => m.key === moodBefore)?.label}
                    </span>
                  </div>
                  <div className="reminiscence-mood-arrow">→</div>
                  <div className="reminiscence-mood-item">
                    <span className="reminiscence-mood-label">{t.mood_after}</span>
                    <span className="reminiscence-mood-value">
                      {MOODS.find(m => m.key === moodAfter)?.icon} {MOODS.find(m => m.key === moodAfter)?.label}
                    </span>
                  </div>
                </div>
              )}
              <div className="reminiscence-completion-actions">
                <button className="btn-green" onClick={handleBack}>
                  {t.explore_more}
                </button>
                <button className="btn-glass" onClick={() => { handleBack(); navigate('/home'); }}>
                  {t.return_home}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showMoodCheck) {
    return (
      <div className="reminiscence-page">
        <Animated3DBackground />
        <div className="reminiscence-container">
          <div className="reminiscence-mood-check">
            <div className="reminiscence-mood-card">
              <span className="reminiscence-mood-big-icon">💭</span>
              <h2>{!moodBefore ? t.how_feeling : t.how_feeling_after}</h2>
              <div className="reminiscence-mood-grid">
                {MOODS.map((mood) => (
                  <button
                    key={mood.key}
                    className="reminiscence-mood-btn"
                    onClick={() => handleMoodSubmit(mood.key)}
                    style={{ '--mood-color': mood.color }}
                  >
                    <span className="reminiscence-mood-btn-icon">{mood.icon}</span>
                    <span className="reminiscence-mood-btn-label">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reminiscence-page">
      <Animated3DBackground />

      <div className="reminiscence-story-container">
        <div className="reminiscence-story-header">
          <button className="reminiscence-back-btn" onClick={handleBack}>
            {t.back_to_stories}
          </button>
          <div className="reminiscence-story-controls">
            <select
              className="reminiscence-voice-select"
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
            >
              {VOICE_OPTIONS.map(v => (
                <option key={v.lang} value={v.lang}>{v.label}</option>
              ))}
            </select>
            <select
              className="reminiscence-font-select"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="reminiscence-chapter-progress">
          {storyData?.chapters?.map((_, idx) => (
            <button
              key={idx}
              className={`reminiscence-progress-dot ${idx === currentChapter ? 'active' : ''} ${completedChapters.includes(idx) ? 'completed' : ''}`}
              onClick={() => handleChapterClick(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {chapter && (
          <div className="reminiscence-chapter-viewer">
            <div className="reminiscence-chapter-image-container">
              <img
                src={chapter.image}
                alt={chapter.title}
                className="reminiscence-chapter-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = `linear-gradient(135deg, #7a9a7a33, #7a9a7a11)`;
                }}
              />
              <div className="reminiscence-chapter-image-overlay" />
              <div className="reminiscence-chapter-image-title">
                <span className="reminiscence-chapter-number">
                  {t.chapter_of?.replace('{{current}}', currentChapter + 1).replace('{{total}}', totalChapters) || `Chapter ${currentChapter + 1} / ${totalChapters}`}
                </span>
                <h2 className="reminiscence-chapter-heading">{t.chapters?.[selectedTheme?.key]?.[currentChapter] || chapter.title}</h2>
              </div>
            </div>

            <div className="reminiscence-chapter-content" ref={textRef}>
              <p
                className="reminiscence-chapter-text"
                style={{ fontSize: fontSizeMap[fontSize] }}
              >
                {chapter.text}
              </p>

              <div className="reminiscence-chapter-actions">
                <button
                  className="reminiscence-play-btn"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? `⏸ ${t.pause}` : `🔊 ${t.read_aloud}`}
                </button>
              </div>
            </div>

            <div className="reminiscence-chapter-nav">
              <button
                className="reminiscence-nav-btn"
                onClick={handlePrev}
                disabled={currentChapter === 0}
              >
                {t.previous}
              </button>
              <span className="reminiscence-nav-page">
                {currentChapter + 1} / {totalChapters}
              </span>
              <button
                className="reminiscence-nav-btn"
                onClick={() => {
                  setCompletedChapters(p => [...new Set([...p, currentChapter])]);
                  handleNext();
                }}
                disabled={currentChapter === totalChapters - 1}
              >
                {t.next}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
