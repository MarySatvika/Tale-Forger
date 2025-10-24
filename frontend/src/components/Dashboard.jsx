import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// Define the custom colors based on the user's provided CSS variables
const COLORS = {
  BG: '#1a1a2e',
  CARD: '#2b2b40',
  ACCENT_1: '#b860ff', // Purple
  ACCENT_2: '#8aff8a', // Neon Green
  TEXT: '#f0f0f0',
  SUBTLE_TEXT: '#ccc',
};

// Create a local API instance to avoid relative path import errors
const api = axios.create({
  baseURL: '/api',
});

// Utility function to format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function Dashboard({ token, onLogout }) {
  const [selectedGenres, setSelectedGenres] = useState(new Set());
  const [title, setTitle] = useState('');
  const [hints, setHints] = useState('');
  const [story, setStory] = useState(null);
  const [storiesHistory, setStoriesHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentView, setCurrentView] = useState('generator');
  // State for User Details Modal
  const [showUserDetails, setShowUserDetails] = useState(false); 

  const genres = ['Fantasy', 'Sci-Fi', 'Horror', 'Comedy', 'Mystery', 'Romance', 'Adventure', 'Thriller', 'Dystopian'];

  // Set auth token header globally and fetch history on component mount
  useEffect(() => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchHistory();
  }, [token]);

  // Use a simple ID derived from the token as a user identifier (for display only)
  const userIdDisplay = useMemo(() => {
    return `${token ? token.slice(0, 4) + '...' + token.slice(-4) : 'Guest'}`;
  }, [token]);


  // --- Data Fetching for History ---
  const fetchHistory = async () => {
    setErrorMessage('');
    try {
      const res = await api.get('/stories');
      // Sort stories by creation date, newest first (optional, but good practice)
      const sortedStories = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setStoriesHistory(sortedStories);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setErrorMessage('Failed to load story history.');
    }
  };


  const toggleGenre = (g) => {
    const s = new Set(selectedGenres);
    if (s.has(g)) s.delete(g); else s.add(g);
    setSelectedGenres(s);
  };

  const handleGenerate = async () => {
    if (!title || !hints || selectedGenres.size === 0) {
      setErrorMessage('Please provide a title, hints, and select at least one genre.');
      return;
    }
    
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post('/stories', {
        title,
        hints,
        genres: Array.from(selectedGenres)
      });

      setStory(res.data); 
      setTitle('');
      setHints('');
      setSelectedGenres(new Set());
      
      fetchHistory();
      setCurrentView('generator');

    } catch (err) {
      const msg = err.response?.data?.msg || 'An unknown error occurred during story generation.';
      setErrorMessage(msg);
      setStory(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Rendering Functions ---

  const renderUserDetailsModal = () => (
    // User Profile Modal (dark themed)
    <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
        <div className="modal-content card" onClick={e => e.stopPropagation()}>
            <h2>User Profile</h2>
            <p><strong>Authenticated ID:</strong> <span style={{color: COLORS.ACCENT_2}}>{userIdDisplay}</span></p>
            <p className="mt-2">Welcome to TaleForge! This is a placeholder for future user settings and profile details.</p>
            <p className="text-sm subtle-text-color mt-4">Note: User data is tied to your unique authentication token.</p>
            <button className="action-btn primary-btn mt-6" onClick={() => setShowUserDetails(false)}>Close</button>
        </div>
    </div>
  );

  const renderGeneratorView = () => (
    <main className="generator-container">
      <div className="card">
        <h2>Create Your Story</h2>

        <section className="genre-section">
          <h3>Select Genres</h3>
          <div className="genre-grid">
            {genres.map(g => (
              <button 
                key={g} 
                className={`genre-btn ${selectedGenres.has(g) ? 'selected' : ''}`} 
                onClick={() => toggleGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        <section className="hints-section">
          <div className="hints-form">
            <div className="input-group">
              <label>Story Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., The Midnight Glitch" />
            </div>
            <div className="input-group">
              <label>Story Hints</label>
              <textarea rows={6} value={hints} onChange={e => setHints(e.target.value)} placeholder="Describe characters, setting, key plot points..." />
            </div>
            <button className="action-btn primary-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? 'GENERATING...' : 'GENERATE STORY'}
            </button>
          </div>
        </section>
      </div>
      
      {story && (
        <section className="card story-output-card">
          <h3>{story.title}</h3>
          <p className="subtle-text-color mb-3">Genres: {story.genres.join(', ')}</p>
          <div className="story-box whitespace-pre-wrap">{story.content}</div>
        </section>
      )}
    </main>
  );

  const renderHistoryView = () => (
    <main className="history-container">
      <div className="card">
        <h2>Story History ({storiesHistory.length} found)</h2>
        
        {storiesHistory.length === 0 ? (
          <p className="text-center subtle-text-color py-8">You haven't generated any stories yet. Start creating!</p>
        ) : (
          <ul className="story-list mt-4">
            {storiesHistory.map((hStory) => (
              <li 
                key={hStory._id} 
                className="story-item"
                onClick={() => {
                  setStory(hStory);
                  setCurrentView('generator');
                }}
              >
                <div className="story-info">
                  <span className="story-title">{hStory.title}</span>
                  <span className="story-genres">{hStory.genres.join(', ')}</span>
                </div>
                <span className="story-date">{formatDate(hStory.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );

  // --- Main Component Render ---
  return (
    <div className="container dashboard-container">
      <header className="main-header">
        <h1 className="logo">TaleForge</h1>
        
        <nav className="header-nav">
          <button 
            className={`nav-btn action-btn ${currentView === 'generator' ? 'active' : ''}`} 
            onClick={() => setCurrentView('generator')}
          >
            Generator
          </button>
          <button 
            className={`nav-btn action-btn ${currentView === 'history' ? 'active' : ''}`} 
            onClick={() => fetchHistory() && setCurrentView('history')}
          >
            History ({storiesHistory.length})
          </button>
        </nav>

        <div className="user-controls">
          {/* USER PROFILE BUTTON */}
          <button 
            className="action-btn user-profile-btn" 
            onClick={() => setShowUserDetails(true)}
            aria-label={`User Profile: ${userIdDisplay}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {userIdDisplay}
          </button>
          {/* Logout Button (moved to header bar for better layout) */}
          <button id="logout-btn" className="action-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>
      
      {/* Error Message Display (styled with accent colors) */}
      {errorMessage && (
        <div className="error-message card" style={{borderColor: COLORS.ACCENT_2, borderLeft: `5px solid ${COLORS.ACCENT_2}`, background: '#33264d', padding: '15px', marginBottom: '20px'}}>
          <strong style={{color: COLORS.ACCENT_2}}>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Conditional View Rendering */}
      {currentView === 'generator' && renderGeneratorView()}
      {currentView === 'history' && renderHistoryView()}
      
      {/* User Details Modal */}
      {showUserDetails && renderUserDetailsModal()}

      <style jsx global>{`
        /* --- USER-PROVIDED CSS VARIABLES --- */
        :root {
            --bg-color: ${COLORS.BG};
            --card-color: ${COLORS.CARD};
            --accent-color-1: ${COLORS.ACCENT_1}; /* Purple */
            --accent-color-2: ${COLORS.ACCENT_2}; /* Neon Green */
            --text-color: ${COLORS.TEXT};
            --subtle-text-color: ${COLORS.SUBTLE_TEXT};
            --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* --- GLOBAL STYLES --- */
        body {
            font-family: 'Inter', sans-serif; /* Using Inter as per default, but can be changed to Roboto */
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: 20px;
            box-sizing: border-box;
            min-height: 100vh;
        }

        .container {
            max-width: 900px;
            width: 100%;
            margin: 0 auto;
        }
        
        /* --- LAYOUT & HEADER --- */
        .main-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid var(--card-color);
            position: relative; /* Context for absolute logout button, though we are removing that */
        }
        
        .logo {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--accent-color-1);
            text-shadow: 0 0 10px var(--accent-color-1);
            letter-spacing: 1px;
            margin: 0;
        }
        
        .header-nav {
          display: flex;
          gap: 15px;
        }

        /* --- FIX: Make user-controls a flex container for side-by-side buttons --- */
        .user-controls {
            display: flex; 
            gap: 10px;
            align-items: center;
        }
        /* --- END FIX --- */

        /* --- CARD STYLES --- */
        .card, .modal-content {
            background-color: var(--card-color);
            padding: 2.5rem;
            border-radius: 20px;
            box-shadow: var(--card-shadow);
            margin-bottom: 2rem;
            border: 2px solid var(--accent-color-2);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }

        h2, h3 {
            color: var(--accent-color-2);
            text-shadow: 0 0 5px var(--accent-color-2);
            margin-bottom: 1.5rem;
            font-weight: 700;
        }
        
        .card h2 {
            text-align: center;
            border-bottom: 1px solid var(--card-color); /* Subtle divider */
            padding-bottom: 10px;
        }

        /* --- BUTTONS --- */
        .action-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
        }
        
        .nav-btn {
            background: var(--card-color);
            color: var(--subtle-text-color);
            border: 1px solid var(--card-color);
            padding: 10px 18px;
        }
        .nav-btn.active {
            background-color: var(--accent-color-1);
            color: var(--bg-color);
            box-shadow: 0 0 10px var(--accent-color-1);
        }
        .nav-btn:hover {
            transform: translateY(-1px);
            background-color: #33334d;
        }
        .nav-btn.active:hover {
            background-color: ${COLORS.ACCENT_1};
        }

        .primary-btn {
            background-color: var(--accent-color-2);
            color: var(--bg-color);
            width: 100%;
        }

        .primary-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(138, 255, 138, 0.4);
        }

        .primary-btn:disabled {
            background-color: var(--accent-color-2);
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .logout-btn {
            background: transparent;
            color: var(--accent-color-1);
            border: 2px solid var(--accent-color-1);
            padding: 10px 20px;
            /* Ensure old absolute positioning is ignored/removed */
            position: static; 
            top: auto;
            right: auto;
        }

        .logout-btn:hover {
            background-color: var(--accent-color-1);
            color: var(--bg-color);
            transform: scale(1.05);
        }
        
        .user-profile-btn {
            background: var(--card-color);
            color: var(--accent-color-1);
            border: 2px solid var(--accent-color-1);
            padding: 10px 20px;
        }
        .user-profile-btn:hover {
            background-color: var(--accent-color-1);
            color: var(--bg-color);
            transform: scale(1.05);
        }

        /* --- GENRE BUTTONS --- */
        .genre-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            margin-bottom: 2rem;
        }

        .genre-btn {
            padding: 12px 24px;
            border: 2px solid var(--accent-color-1);
            border-radius: 50px;
            background: transparent;
            cursor: pointer;
            font-size: 1rem;
            color: var(--text-color);
            transition: all 0.3s ease-in-out;
            text-transform: uppercase;
        }

        .genre-btn:hover {
            background-color: var(--accent-color-1);
            box-shadow: 0 0 15px var(--accent-color-1);
            transform: translateY(-3px);
        }

        .genre-btn.selected {
            background-color: var(--accent-color-2);
            color: var(--bg-color);
            border-color: var(--accent-color-2);
            box-shadow: 0 0 15px var(--accent-color-2);
            transform: scale(1.05);
        }

        /* --- FORMS & INPUTS --- */
        .input-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--subtle-text-color);
        }

        input, textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid var(--card-color);
            background-color: #33334d;
            border-radius: 8px;
            font-size: 1rem;
            color: var(--text-color);
            transition: border-color 0.3s, box-shadow 0.3s;
        }

        input:focus, textarea:focus {
            outline: none;
            border-color: var(--accent-color-1);
            box-shadow: 0 0 10px var(--accent-color-1);
        }

        /* --- STORY OUTPUT --- */
        .story-output-card {
            border: 2px solid var(--accent-color-1);
        }

        .story-box {
            background-color: #26263b;
            padding: 2rem;
            border-radius: 12px;
            white-space: pre-wrap;
            line-height: 1.8;
            border-left: 5px solid var(--accent-color-2);
            max-height: 500px;
            overflow-y: auto;
        }

        .subtle-text-color {
            color: var(--subtle-text-color);
        }

        /* --- HISTORY LIST --- */
        .story-list {
          list-style: none;
          padding: 0;
        }
        .story-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          margin-bottom: 10px;
          background-color: #33334d; /* Slightly different background for list items */
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 5px solid var(--accent-color-1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .story-item:hover {
          background-color: #3a3a55;
          transform: scale(1.01);
          border-left-color: var(--accent-color-2);
        }
        .story-info {
          display: flex;
          flex-direction: column;
        }
        .story-title {
          font-weight: 600;
          color: var(--text-color);
        }
        .story-genres {
          font-size: 0.9rem;
          color: var(--subtle-text-color);
        }
        .story-date {
          font-size: 0.9rem;
          color: var(--subtle-text-color);
        }


        /* --- MODAL STYLES --- */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal-content {
            padding: 30px;
            animation: fadeIn 0.3s ease-out;
            margin: 0; /* Override margin-bottom from .card */
            border-color: var(--accent-color-1);
        }
        .modal-content h2 {
            border-bottom: 2px solid var(--accent-color-1);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* --- RESPONSIVENESS --- */
        @media (max-width: 768px) {
          .main-header {
            flex-direction: column;
            gap: 15px;
            padding-bottom: 10px;
          }
          .logo {
            margin-bottom: 10px;
          }
          .user-controls {
            width: 100%;
            justify-content: center;
          }
          .action-btn {
            padding: 10px 15px;
            font-size: 0.9rem;
          }
          .nav-btn {
            font-size: 0.8rem;
          }
        }
        @media (max-width: 500px) {
          .card {
            padding: 1.5rem;
          }
          .user-controls {
            flex-direction: column;
            gap: 10px;
          }
          .user-profile-btn, .logout-btn {
            width: 100%;
            text-align: center;
          }
          .story-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}
