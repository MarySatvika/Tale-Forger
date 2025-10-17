import React, { useState } from 'react';
import api from '../api';

export default function Register({ onLoginClick }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return alert('Passwords do not match');
    try {
      const res = await api.post('/auth/register', { username, email, password });
      alert('Registration successful — you are now logged in');
      localStorage.setItem('taleforge_token', res.data.token);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h1 className="logo">TaleForge</h1>
      <div className="register-card card">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group"><label>Username</label><input value={username} onChange={e=>setUsername(e.target.value)} required/></div>
          <div className="input-group"><label>Email Address</label><input value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div className="input-group"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
          <div className="input-group"><label>Confirm Password</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></div>
          <button className="action-btn primary-btn" type="submit">Register</button>
        </form>
        <p className="login-link">Already have an account? <a onClick={onLoginClick} style={{cursor:'pointer'}}>Login</a></p>
      </div>
    </div>
  );
}
