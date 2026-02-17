import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

import { API_URL } from '../config';

const VendorLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
    setMessage({ text: 'Logging in...', type: 'info' });

    try {
      const response = await fetch(`${API_URL}/api/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('vendor', JSON.stringify(data.data));
        localStorage.setItem('vendorId', data.data.id);
        setMessage({ text: '✅ Login successful! Redirecting...', type: 'success' });
        showToast('Login successful!', 'success');
        setTimeout(() => {
          navigate('/vendor-dashboard');
        }, 1000);
      } else {
        setMessage({ text: `❌ ${data.message || 'Login failed'}`, type: 'error' });
        showToast(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      setMessage({
        text: '❌ Error: Unable to connect to server. Make sure backend is running.',
        type: 'error'
      });
      showToast('Error connecting to server', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !newPassword) {
      showToast('Please enter email and new password', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vendor/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, new_password: newPassword })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Password reset successfully! You can now login.', 'success');
        setMessage({ text: '✅ Password reset! Login with your new password.', type: 'success' });
        setShowReset(false);
        setFormData({ ...formData, email: resetEmail, password: '' });
      } else {
        showToast(data.message || 'Reset failed', 'error');
        setMessage({ text: `❌ ${data.message}`, type: 'error' });
      }
    } catch (error) {
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h2 className="form-title">Vendor Login</h2>
        <p className="form-subtitle">Access your vendor dashboard</p>

        {!showReset ? (
          <>
            <form onSubmit={handleSubmit} aria-label="Vendor login form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  required
                  placeholder="vendor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>

              {message.text && (
                <div className={`message ${message.type}`} role="alert">
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                aria-label="Login button"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <p className="form-footer">
              <button
                onClick={() => setShowReset(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  font: 'inherit',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleResetPassword} aria-label="Reset password form">
              <div className="form-group">
                <label htmlFor="reset-email" className="form-label">
                  Vendor Email
                </label>
                <input
                  type="email"
                  id="reset-email"
                  className="form-input"
                  required
                  placeholder="vendor@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="form-input"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength="6"
                />
              </div>

              {message.text && (
                <div className={`message ${message.type}`} role="alert">
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <p className="form-footer">
              <button
                onClick={() => { setShowReset(false); setMessage({ text: '', type: '' }); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  font: 'inherit',
                  padding: 0
                }}
              >
                ← Back to Login
              </button>
            </p>
          </>
        )}

        <p className="form-footer">
          Don't have a vendor account? <Link to="/vendor-register">Register here</Link>
        </p>
        <p className="form-footer">
          Want to shop? <Link to="/">Go to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;
