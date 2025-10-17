import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard({ token, onLogout }) {
  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [title, setTitle] = useState('');
  const [hints, setHints] = useState('');
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, [token]);

  const genres = ['Fantasy','Sci-Fi','Horror','Comedy','Mystery','Romance','Adventure','Thriller','Dystopian'];

  const toggleGenre = (g) => {
    const s = new Set(selectedGenres);
    if (s.has(g)) s.delete(g); else s.add(g);
    setSelectedGenres(s);
  };

  const handleGenerate = async () => {
    if (!title || !hints || selectedGenres.size === 0) {
      return alert('Please provide a title, hints, and select at least one genre.');
    }
    setLoading(true);
    try {
      const res = await api.post('/stories', {
        title,
        hints,
        genres: Array.from(selectedGenres)
      });
      setStory(res.data);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to generate story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '1rem'}}>
        <h1 className="logo">TaleForge</h1>
        <button id="logout-btn" className="action-btn logout-btn" onClick={onLogout}>Logout</button>
      </header>

      <main className="card">
        <h2>Create Your Story</h2>

        <section className="genre-section">
          <h3>Select Genres</h3>
          <div className="genre-grid">
            {genres.map(g => (
              <button key={g} className={`genre-btn ${selectedGenres.has(g) ? 'selected' : ''}`} onClick={() => toggleGenre(g)}>{g}</button>
            ))}
          </div>
        </section>

        <section className="hints-section">
          <h3>Provide Hints</h3>
          <div className="hints-form">
            <div className="input-group">
              <label>Story Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., The Midnight Glitch" />
            </div>
            <div className="input-group">
              <label>Story Hints</label>
              <textarea rows={6} value={hints} onChange={e=>setHints(e.target.value)} placeholder="Describe characters, setting, key plot points..." />
            </div>
            <button className="action-btn primary-btn" onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate Story'}</button>
          </div>
        </section>
      </main>

      {story && (
        <section className="card story-output-card">
          <h3>Your Generated Story</h3>
          <div className="story-box">{story.content}</div>
        </section>
      )}
    </div>
  );
}
