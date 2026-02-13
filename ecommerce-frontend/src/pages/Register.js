import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const API_URL = 'http://localhost:5001';

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
    setMessage({ text: 'Creating account...', type: 'info' });

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: '✅ Account created! Redirecting...', type: 'success' });
        showToast('Account created successfully!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setMessage({ text: `❌ ${data.message || 'Registration failed'}`, type: 'error' });
        showToast(data.message || 'Registration failed', 'error');
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

  return (
    <div className="form-page">
      <div className="form-container">
        <h2 className="form-title">Create Account</h2>
        <p className="form-subtitle">Join Furnii and start shopping</p>

        <form onSubmit={handleSubmit} aria-label="Registration form">
          <div className="form-group">
            <label htmlFor="full_name" className="form-label">
              Full Name
            </label>
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
              aria-required="true"
            />
          </div>

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
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
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
              aria-required="true"
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
              autoComplete="new-password"
              aria-required="true"
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
            aria-label="Register button"
          >
            {loading ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
