import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { personalStoriesApi } from '../services/api';
import Animated3DBackground from '../components/ui/Animated3DBackground.jsx';

const COLORS = ['#7a9a7a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];
const ICONS = ['📖', '🏡', '🏫', '🎉', '💼', '💒', '🌿', '🎵', '👨‍👩‍👧', '🌅', '🎂', '✈️'];

export default function CaregiverStoriesPage() {
  const { patient } = usePatient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: '📖',
    color: '#7a9a7a',
    chapters: [{ title: '', text: '' }],
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
  });

  const loadStories = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await personalStoriesApi.getByCaregiver(user._id);
      setStories(res.data || []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStories(); }, [user]);

  const resetForm = () => {
    setForm({
      title: '', description: '', icon: '📖', color: '#7a9a7a',
      chapters: [{ title: '', text: '' }],
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });
    setEditingStory(null);
    setShowForm(false);
  };

  const handleEdit = (story) => {
    setForm({
      title: story.title,
      description: story.description || '',
      icon: story.icon || '📖',
      color: story.color || '#7a9a7a',
      chapters: story.chapters?.length > 0 ? story.chapters : [{ title: '', text: '' }],
      questions: story.questions?.length > 0
        ? story.questions.map(q => ({ question: q.question, options: q.options, correctAnswer: q.correctAnswer }))
        : [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    });
    setEditingStory(story);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this story?')) return;
    try {
      await personalStoriesApi.remove(id);
      loadStories();
    } catch {}
  };

  const addChapter = () => {
    setForm(f => ({ ...f, chapters: [...f.chapters, { title: '', text: '' }] }));
  };

  const removeChapter = (idx) => {
    if (form.chapters.length <= 1) return;
    setForm(f => ({ ...f, chapters: f.chapters.filter((_, i) => i !== idx) }));
  };

  const updateChapter = (idx, field, value) => {
    setForm(f => ({
      ...f,
      chapters: f.chapters.map((ch, i) => i === idx ? { ...ch, [field]: value } : ch),
    }));
  };

  const addQuestion = () => {
    setForm(f => ({
      ...f,
      questions: [...f.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    }));
  };

  const removeQuestion = (idx) => {
    if (form.questions.length <= 1) return;
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  };

  const updateQuestion = (idx, field, value) => {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => i === idx ? { ...q, [field]: value } : q),
    }));
  };

  const updateOption = (qIdx, oIdx, value) => {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options];
        opts[oIdx] = value;
        return { ...q, options: opts };
      }),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || form.chapters.some(ch => !ch.title || !ch.text)) {
      alert('Please fill in the story title and all chapter titles and texts.');
      return;
    }

    const validQuestions = form.questions.filter(q => q.question && q.options.every(o => o.trim()));

    const payload = {
      caregiverId: user._id,
      patientId: patient?._id,
      title: form.title,
      description: form.description,
      icon: form.icon,
      color: form.color,
      chapters: form.chapters,
      questions: validQuestions,
    };

    try {
      if (editingStory) {
        await personalStoriesApi.update(editingStory._id, payload);
      } else {
        await personalStoriesApi.create(payload);
      }
      resetForm();
      loadStories();
    } catch (err) {
      alert(err.message || 'Failed to save story');
    }
  };

  const caregiver = user;

  return (
    <div className="reminiscence-page">
      <Animated3DBackground />
      <div className="reminiscence-container">
        <div className="reminiscence-hero">
          <div className="reminiscence-hero-content">
            <p className="home-card-eyebrow">Personal Stories</p>
            <h1 className="page-title">Write Patient Stories</h1>
            <p className="page-subtitle">
              Create real-life stories from the patient's memory. Each story includes chapters and comprehension questions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button className="btn-green" onClick={() => { resetForm(); setShowForm(true); }}>
            + New Story
          </button>
        </div>

        {showForm && (
          <div className="reminiscence-mood-card" style={{ marginBottom: '30px', padding: '30px' }}>
            <h2 style={{ marginBottom: '20px', color: '#2d5a27' }}>
              {editingStory ? 'Edit Story' : 'New Story'}
            </h2>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Story Title</label>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. My First Day at School"
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input
                  style={inputStyle}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="A brief description of the story"
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Icon</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setForm(f => ({ ...f, icon }))}
                        style={{
                          ...iconBtnStyle,
                          background: form.icon === icon ? '#2d5a27' : 'transparent',
                          color: form.icon === icon ? '#fff' : '#333',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Color</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setForm(f => ({ ...f, color }))}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: color, border: form.color === color ? '3px solid #1a3a1a' : '2px solid #ccc',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#2d5a27', margin: 0 }}>Chapters</h3>
                <button className="btn-glass" onClick={addChapter} style={{ fontSize: '13px', padding: '6px 12px' }}>
                  + Add Chapter
                </button>
              </div>
              {form.chapters.map((ch, idx) => (
                <div key={idx} style={chapterCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#2d5a27' }}>Chapter {idx + 1}</span>
                    {form.chapters.length > 1 && (
                      <button onClick={() => removeChapter(idx)} style={removeBtnStyle}>✕</button>
                    )}
                  </div>
                  <input
                    style={{ ...inputStyle, marginBottom: '8px' }}
                    value={ch.title}
                    onChange={e => updateChapter(idx, 'title', e.target.value)}
                    placeholder="Chapter title"
                  />
                  <textarea
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    value={ch.text}
                    onChange={e => updateChapter(idx, 'text', e.target.value)}
                    placeholder="Write the story chapter text here..."
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#2d5a27', margin: 0 }}>Comprehension Questions</h3>
                <button className="btn-glass" onClick={addQuestion} style={{ fontSize: '13px', padding: '6px 12px' }}>
                  + Add Question
                </button>
              </div>
              {form.questions.map((q, qIdx) => (
                <div key={qIdx} style={chapterCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#2d5a27' }}>Question {qIdx + 1}</span>
                    {form.questions.length > 1 && (
                      <button onClick={() => removeQuestion(qIdx)} style={removeBtnStyle}>✕</button>
                    )}
                  </div>
                  <input
                    style={{ ...inputStyle, marginBottom: '8px' }}
                    value={q.question}
                    onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                    placeholder="Enter your question"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctAnswer === oIdx}
                          onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                          style={{ accentColor: '#2d5a27' }}
                        />
                        <input
                          style={{ ...inputStyle, margin: 0 }}
                          value={opt}
                          onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    Select the radio button next to the correct answer
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-green" onClick={handleSubmit}>
                {editingStory ? 'Update Story' : 'Create Story'}
              </button>
              <button className="btn-glass" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="reminiscence-loading">
            <div className="reminiscence-spinner" />
            <p>Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
            <h3 style={{ color: '#2d5a27', marginBottom: '8px' }}>No stories yet</h3>
            <p>Click "New Story" to create your first patient story.</p>
          </div>
        ) : (
          <div className="reminiscence-themes-grid">
            {stories.map(story => (
              <div key={story._id} className="reminiscence-theme-card" style={{ '--theme-color': story.color || '#7a9a7a' }}>
                <div className="reminiscence-theme-image" style={{ height: '140px' }}>
                  <div className="reminiscence-theme-overlay" style={{ background: `linear-gradient(135deg, ${story.color}44, ${story.color}11)` }} />
                  <span className="reminiscence-theme-icon" style={{ fontSize: '48px' }}>{story.icon || '📖'}</span>
                </div>
                <div className="reminiscence-theme-body">
                  <h3 className="reminiscence-theme-title">{story.title}</h3>
                  <p className="reminiscence-theme-desc">{story.description || 'No description'}</p>
                  <div className="reminiscence-theme-meta">
                    <span>{story.chapters?.length || 0} chapters · {story.questions?.length || 0} questions</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn-glass" onClick={() => handleEdit(story)} style={{ flex: 1, fontSize: '13px', padding: '8px' }}>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(story._id)}
                      style={{ ...removeBtnStyle, flex: 1, fontSize: '13px', padding: '8px', borderRadius: '10px', border: '1px solid #e5c8c8' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#2d5a27', marginBottom: '6px' };
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #c8dcc8', background: '#fff', fontSize: '14px',
  color: '#1a1a1a', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};
const iconBtnStyle = {
  width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #ccc',
  cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const chapterCardStyle = {
  background: '#f8fdf8', borderRadius: '12px', padding: '16px', marginBottom: '12px',
  border: '1px solid #e0ede0',
};
const removeBtnStyle = {
  background: 'none', border: 'none', color: '#c44', cursor: 'pointer',
  fontSize: '16px', padding: '4px 8px', borderRadius: '6px',
};
