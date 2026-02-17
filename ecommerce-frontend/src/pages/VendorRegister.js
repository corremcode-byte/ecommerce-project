import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

import { API_URL } from '../config';

const VendorRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    business_name: '',
    owner_name: '',
    gst_number: '',
    business_address: '',
    city: '',
    state: '',
    postal_code: '',
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
    setMessage({ text: 'Submitting application...', type: 'info' });

    try {
      const response = await fetch(`${API_URL}/api/vendor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: '✅ Application submitted! Waiting for admin approval.', type: 'success' });
        showToast('Vendor application submitted successfully!', 'success');
        setTimeout(() => {
          navigate('/vendor-login');
        }, 2000);
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
      <div className="form-container vendor-form-container">
        <h2 className="form-title">Become a Vendor</h2>
        <p className="form-subtitle">Join our marketplace and start selling your products</p>

        <form onSubmit={handleSubmit} aria-label="Vendor registration form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="business_name" className="form-label">
                Business Name *
              </label>
              <input
                type="text"
                id="business_name"
                name="business_name"
                className="form-input"
                required
                placeholder="Your Business Name"
                value={formData.business_name}
                onChange={handleChange}
                autoComplete="organization"
              />
            </div>

            <div className="form-group">
              <label htmlFor="owner_name" className="form-label">
                Owner Name *
              </label>
              <input
                type="text"
                id="owner_name"
                name="owner_name"
                className="form-input"
                required
                placeholder="Owner Full Name"
                value={formData.owner_name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                required
                placeholder="business@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone Number *
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
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gst_number" className="form-label">
              GST Number *
            </label>
            <input
              type="text"
              id="gst_number"
              name="gst_number"
              className="form-input"
              required
              placeholder="29ABCDE1234F1Z5"
              value={formData.gst_number}
              onChange={handleChange}
              pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
              title="Enter valid GST number (e.g., 29ABCDE1234F1Z5)"
            />
            <small className="form-hint">Format: 29ABCDE1234F1Z5</small>
          </div>

          <div className="form-group">
            <label htmlFor="business_address" className="form-label">
              Business Address *
            </label>
            <textarea
              id="business_address"
              name="business_address"
              className="form-input form-textarea"
              required
              placeholder="Complete business address"
              value={formData.business_address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-input"
                required
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                autoComplete="address-level2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state" className="form-label">
                State *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                className="form-input"
                required
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                autoComplete="address-level1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code" className="form-label">
                Postal Code *
              </label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                className="form-input"
                required
                placeholder="123456"
                value={formData.postal_code}
                onChange={handleChange}
                autoComplete="postal-code"
                pattern="[0-9]{6}"
                title="Enter 6-digit postal code"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
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
            aria-label="Submit vendor application"
          >
            {loading ? (
              <>
                <span className="loading-spinner" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>

        <p className="form-footer">
          Already have a vendor account? <Link to="/vendor-login">Login here</Link>
        </p>
        <p className="form-footer">
          Want to shop? <Link to="/">Go to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default VendorRegister;
