import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

import { API_URL } from '../config';

const Profile = () => {
  const { user, userId, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    mobile: '',
    dob: ''
  });
  const [addressForm, setAddressForm] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const loadProfile = () => {
    if (user) {
      setEditForm({
        full_name: user.full_name || '',
        mobile: user.phone || '',
        dob: user.dob || ''
      });
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/addresses/${userId}`);
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (data.success) {
        showToast('Profile updated successfully', 'success');
        setShowEditModal(false);
        window.location.reload(); // Refresh to update user data
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Error updating profile', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addressForm,
          user_id: parseInt(userId)
        })
      });

      const data = await response.json();
      if (data.success) {
        showToast('Address added successfully', 'success');
        setShowAddAddressModal(false);
        setAddressForm({
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'India',
          is_default: false
        });
        loadAddresses();
      } else {
        showToast(data.message || 'Failed to add address', 'error');
      }
    } catch (error) {
      showToast('Error adding address', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="main-container">
      <div className="page-hero">
        <h1 className="page-title">My Account</h1>
        <p className="page-subtitle">Manage your profile and addresses</p>
      </div>

      <div className="profile-layout">
        {/* Personal Information */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
            <button
              onClick={() => {
                loadProfile();
                setShowEditModal(true);
              }}
              className="btn btn-secondary"
              aria-label="Edit profile"
            >
              Edit Profile
            </button>
          </div>
          <div className="profile-details">
            <div className="info-row">
              <span className="info-label">Full Name:</span>
              <span className="info-value">{user?.full_name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{user?.phone || 'N/A'}</span>
            </div>
            {user?.dob && (
              <div className="info-row">
                <span className="info-label">Date of Birth:</span>
                <span className="info-value">{user.dob}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Addresses */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">Delivery Addresses</h2>
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="btn btn-primary"
              aria-label="Add new address"
            >
              + Add New Address
            </button>
          </div>
          {addresses.length === 0 ? (
            <p className="empty-text">No addresses added yet</p>
          ) : (
            <div>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-item ${addr.is_default ? 'default-address' : ''}`}
                >
                  {addr.is_default && (
                    <span className="default-badge">Default</span>
                  )}
                  <p className="address-line"><strong>{addr.address_line1}</strong></p>
                  {addr.address_line2 && (
                    <p className="address-line">{addr.address_line2}</p>
                  )}
                  <p className="address-line">
                    {addr.city}, {addr.state} - {addr.postal_code}
                  </p>
                  <p className="address-line">{addr.country}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal" style={{ display: 'flex' }} role="dialog" aria-labelledby="edit-profile-title">
          <div className="modal-content">
            <span
              onClick={() => setShowEditModal(false)}
              className="modal-close"
              aria-label="Close modal"
            >
              &times;
            </span>
            <h3 id="edit-profile-title" className="modal-title">Edit Profile</h3>
            <form onSubmit={handleEditProfile}>
              <div className="form-group">
                <label htmlFor="edit_full_name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="edit_full_name"
                  className="form-input"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_mobile" className="form-label">Mobile</label>
                <input
                  type="tel"
                  id="edit_mobile"
                  className="form-input"
                  required
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit_dob" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  id="edit_dob"
                  className="form-input"
                  required
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="modal" style={{ display: 'flex' }} role="dialog" aria-labelledby="add-address-title">
          <div className="modal-content">
            <span
              onClick={() => setShowAddAddressModal(false)}
              className="modal-close"
              aria-label="Close modal"
            >
              &times;
            </span>
            <h3 id="add-address-title" className="modal-title">Add New Address</h3>
            <form onSubmit={handleAddAddress}>
              <div className="form-group">
                <label htmlFor="address_line1" className="form-label">Address Line 1 *</label>
                <input
                  type="text"
                  id="address_line1"
                  className="form-input"
                  required
                  placeholder="House/Flat No., Building"
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address_line2" className="form-label">Address Line 2</label>
                <input
                  type="text"
                  id="address_line2"
                  className="form-input"
                  placeholder="Area, Street"
                  value={addressForm.address_line2}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="city" className="form-label">City *</label>
                <input
                  type="text"
                  id="city"
                  className="form-input"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state" className="form-label">State *</label>
                <input
                  type="text"
                  id="state"
                  className="form-input"
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="postal_code" className="form-label">Postal Code *</label>
                <input
                  type="text"
                  id="postal_code"
                  className="form-input"
                  required
                  pattern="[0-9]{6}"
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  />
                  Set as default address
                </label>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
