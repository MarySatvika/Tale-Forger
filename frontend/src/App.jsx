import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  const [view, setView] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('taleforge_token') || null);

  useEffect(() => {
    if (token) setView('dashboard');
  }, [token]);

  const handleLogin = (token) => {
    localStorage.setItem('taleforge_token', token);
    setToken(token);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('taleforge_token');
    setToken(null);
    setView('login');
  };

  return (
    <div className="container">
      {view === 'login' && <Login onRegisterClick={() => setView('register')} onLogin={handleLogin} />}
      {view === 'register' && <Register onLoginClick={() => setView('login')} />}
      {view === 'dashboard' && <Dashboard token={token} onLogout={handleLogout} />}
      
    </div>
  );
}
