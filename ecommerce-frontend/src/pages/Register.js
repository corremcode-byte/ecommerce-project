import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

import { API_URL } from '../config';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: 'Creating your account...', type: 'info' });

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: 'Account created! Redirecting...', type: 'success' });
        showToast('Account created successfully! ✨', 'success');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setMessage({ text: data.message || 'Registration failed', type: 'error' });
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      setMessage({
        text: 'Unable to connect to server. Please check if backend is running.',
        type: 'error'
      });
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '48px' }}>✨</span>
        </div>
        <h2 className="form-title" style={{ textAlign: 'center' }}>Join Furnii</h2>
        <p className="form-subtitle" style={{ textAlign: 'center' }}>Create your account to start shopping</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name" className="form-label">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="form-input"
              required
              placeholder="John Doe"
              value={formData.full_name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              required
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              required
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="6"
            />
          </div>

          {message.text && (
            <div className={`message ${message.type}`} role="alert">
              {message.type === 'error' ? '⚠️ ' : message.type === 'success' ? '✅ ' : '⏳ '}{message.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
