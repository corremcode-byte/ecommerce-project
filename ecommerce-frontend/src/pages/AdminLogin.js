import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

import { API_URL } from '../config';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setMessage({ text: 'Authenticating...', type: 'info' });

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('admin', JSON.stringify(data.data));
        localStorage.setItem('adminId', data.data.id);
        showToast('Admin access granted ✨', 'success');
        setTimeout(() => navigate('/admin-dashboard'), 1000);
      } else {
        setMessage({ text: data.message || 'Login failed', type: 'error' });
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      setMessage({
        text: 'Unable to connect to server.',
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
          <span style={{ fontSize: '48px' }}>🔒</span>
        </div>
        <h2 className="form-title" style={{ textAlign: 'center' }}>Admin Portal</h2>
        <p className="form-subtitle" style={{ textAlign: 'center' }}>Authorized personnel only</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              required
              placeholder="admin@mail.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
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
              placeholder="Enter admin password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {message.text && (
            <div className={`message ${message.type}`} role="alert">
              {message.type === 'error' ? '⚠️ ' : '⏳ '}{message.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner" />
                Verifying...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <p className="form-footer">
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
