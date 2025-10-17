import React, { useState } from 'react';
import api from '../api';

export default function Login({ onRegisterClick, onLogin }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      onLogin(res.data.token);
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div id="login-page">
      <h1 className="logo">TaleForge</h1>
      <div className="card login-card">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username or Email</label>
            <input value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} placeholder="Enter your username or email" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button className="action-btn primary-btn login-btn" type="submit">Login</button>
        </form>
        <p className="signup-link">Don't have an account? <a onClick={onRegisterClick} style={{cursor:'pointer'}}>Sign Up</a></p>
      </div>
    </div>
  );
}
