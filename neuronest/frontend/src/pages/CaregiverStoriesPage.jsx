import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { personalStoriesApi } from '../services/api';

const COLORS = ['#7a9a7a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];
const ICONS = ['📖', '🏡', '🏫', '🎉', '💼', '💒', '🌿', '🎵', '👨‍👩‍👧', '🌅', '🎂', '✈️'];

const COVER_IMAGES = [
  { label: 'Home', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80' },
  { label: 'School', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80' },
  { label: 'Family', url: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&q=80' },
  { label: 'Work', url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=80' },
  { label: 'Wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80' },
  { label: 'Nature', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80' },
  { label: 'Music', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80' },
  { label: 'Celebration', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80' },
  { label: 'Garden', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80' },
  { label: 'Kitchen', url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80' },
  { label: 'Book', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80' },
  { label: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
];

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

export default function CaregiverStoriesPage() {
  const { patient } = usePatient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', icon: '📖', color: '#7a9a7a', imageUrl: '',
    chapters: [{ title: '', text: '' }],
  });

  const loadStories = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await personalStoriesApi.getByCaregiver(user._id);
      setStories(res.data || []);
    } catch { setStories([]); } finally { setLoading(false); }
  };

  useEffect(() => { loadStories(); }, [user]);

  const resetForm = () => {
    setForm({ title: '', description: '', icon: '📖', color: '#7a9a7a', imageUrl: '', chapters: [{ title: '', text: '' }] });
    setEditingStory(null);
    setShowForm(false);
  };

  const handleEdit = (story) => {
    setForm({
      title: story.title, description: story.description || '', icon: story.icon || '📖', color: story.color || '#7a9a7a', imageUrl: story.imageUrl || '',
      chapters: story.chapters?.length > 0 ? story.chapters : [{ title: '', text: '' }],
    });
    setEditingStory(story);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this story?')) return;
    try { await personalStoriesApi.remove(id); loadStories(); } catch {}
  };

  const addChapter = () => setForm(f => ({ ...f, chapters: [...f.chapters, { title: '', text: '' }] }));
  const removeChapter = (idx) => { if (form.chapters.length > 1) setForm(f => ({ ...f, chapters: f.chapters.filter((_, i) => i !== idx) })); };
  const updateChapter = (idx, field, value) => setForm(f => ({ ...f, chapters: f.chapters.map((ch, i) => i === idx ? { ...ch, [field]: value } : ch) }));

  const handleSubmit = async () => {
    if (!form.title || form.chapters.some(ch => !ch.title || !ch.text)) { alert('Please fill in the story title and all chapter titles and texts.'); return; }
    const payload = { caregiverId: user._id, patientId: patient?._id, title: form.title, description: form.description, icon: form.icon, color: form.color, imageUrl: form.imageUrl, chapters: form.chapters, questions: [] };
    try {
      if (editingStory) await personalStoriesApi.update(editingStory._id, payload);
      else await personalStoriesApi.create(payload);
      resetForm(); loadStories();
    } catch (err) { alert(err.message || 'Failed to save story'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7f0 0%, #e8f4e8 50%, #f5faf5 100%)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#3d7a3d', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Personal Stories</p>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a2e1a', margin: 0 }}>Write Patient Stories</h1>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Create stories with chapters and comprehension questions for your patient.</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(42,90,42,0.3)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(42,90,42,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,90,42,0.3)'; }}>
            + New Story
          </button>
        </div>

        {/* New Story Form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #e0ede0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 24px' }}>{editingStory ? 'Edit Story' : 'New Story'}</h2>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={labelStyle}>Story Title</label>
                <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. My First Day at School" />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input style={inputStyle} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="A brief description of the story" />
              </div>
              <div>
                <label style={labelStyle}>Icon</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{ width: '36px', height: '36px', borderRadius: '8px', border: form.icon === icon ? '2px solid #2d5a27' : '1px solid #ddd', background: form.icon === icon ? '#2d5a27' : '#fff', color: form.icon === icon ? '#fff' : '#333', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Cover Image</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                  {COVER_IMAGES.map((img) => (
                    <button key={img.url} onClick={() => setForm(f => ({ ...f, imageUrl: f.imageUrl === img.url ? '' : img.url }))}
                      style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '10px', border: form.imageUrl === img.url ? '3px solid #2d5a27' : '2px solid #e0ede0', overflow: 'hidden', cursor: 'pointer', padding: 0, background: '#f5f5f5' }}>
                      <img src={img.url} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '2px 4px', textAlign: 'center' }}>{img.label}</span>
                      {form.imageUrl === img.url && (
                        <div style={{ position: 'absolute', top: 4, right: 4, width: '20px', height: '20px', borderRadius: '50%', background: '#2d5a27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</div>
                      )}
                    </button>
                  ))}
                </div>
                {form.imageUrl && (
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Selected image will display on the story card. Click again to remove.</p>
                )}
              </div>
            </div>

            {/* Chapters */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: 0 }}>Chapters</h3>
                <button onClick={addChapter} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #c8dcc8', background: '#f0f7f0', color: '#2d5a27', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Add Chapter</button>
              </div>
              {form.chapters.map((ch, idx) => (
                <div key={idx} style={{ background: '#f8fdf8', borderRadius: '12px', padding: '16px', marginBottom: '12px', border: '1px solid #e0ede0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#2d5a27', fontSize: '14px' }}>Chapter {idx + 1}</span>
                    {form.chapters.length > 1 && <button onClick={() => removeChapter(idx)} style={{ background: 'none', border: 'none', color: '#c44', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}>✕</button>}
                  </div>
                  <input style={{ ...inputStyle, marginBottom: '8px' }} value={ch.title} onChange={e => updateChapter(idx, 'title', e.target.value)} placeholder="Chapter title" />
                  <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={ch.text} onChange={e => updateChapter(idx, 'text', e.target.value)} placeholder="Write the story chapter text here..." />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleSubmit} style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>{editingStory ? 'Update Story' : 'Create Story'}</button>
              <button onClick={resetForm} style={{ padding: '12px 28px', borderRadius: '12px', background: '#f0f0f0', color: '#333', fontSize: '14px', fontWeight: '600', border: '1px solid #ddd', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}><div style={{ width: '32px', height: '32px', margin: '0 auto 16px', border: '3px solid #c8dcc8', borderTopColor: '#3d7a3d', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /><p style={{ color: '#666' }}>Loading stories...</p></div>
        ) : stories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e0ede0' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📝</p>
            <h3 style={{ color: '#1a2e1a', fontSize: '18px', marginBottom: '8px' }}>No stories yet</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Create your first story to help your patient reminisce.</p>
            <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #3d7a3d, #2d5a2d)', color: '#fff', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>+ Create First Story</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {stories.map(story => (
              <div key={story._id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e0ede0', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ height: '120px', background: getStoryImage(story) ? 'none' : `linear-gradient(135deg, ${story.color}33, ${story.color}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {getStoryImage(story) ? (
                    <img src={getStoryImage(story)} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '40px' }}>{story.icon || '📖'}</span>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2e1a', margin: '0 0 4px' }}>{story.title}</h3>
                  <p style={{ fontSize: '13px', color: '#888', margin: '0 0 12px' }}>{story.description || 'No description'}</p>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>{story.chapters?.length || 0} chapters · Auto-generated quiz</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(story)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #c8dcc8', background: '#f0f7f0', color: '#2d5a27', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(story._id)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e5c8c8', background: '#fef2f2', color: '#c44', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
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

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#1a2e1a', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #c8dcc8', background: '#fff', fontSize: '14px', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
