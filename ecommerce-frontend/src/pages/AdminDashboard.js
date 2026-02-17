import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

import { API_URL } from '../config';

const AdminDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, declined
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Check if admin is logged in
    const admin = localStorage.getItem('admin');
    if (!admin) {
      navigate('/admin-login');
      return;
    }
    loadVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, navigate]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? null : filter;
      const url = status 
        ? `${API_URL}/api/admin/vendors?status=${status}`
        : `${API_URL}/api/admin/vendors`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      showToast('Error loading vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/vendors/${vendorId}/approve`, {
        method: 'PUT'
      });
      const data = await response.json();

      if (data.success) {
        showToast('Vendor approved successfully!', 'success');
        loadVendors();
      } else {
        showToast(data.message || 'Failed to approve vendor', 'error');
      }
    } catch (error) {
      showToast('Error approving vendor', 'error');
      console.error('Error:', error);
    }
  };

  const handleDecline = async (vendorId) => {
    if (!window.confirm('Are you sure you want to decline this vendor application?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/vendors/${vendorId}/decline`, {
        method: 'PUT'
      });
      const data = await response.json();

      if (data.success) {
        showToast('Vendor declined successfully!', 'success');
        loadVendors();
      } else {
        showToast(data.message || 'Failed to decline vendor', 'error');
      }
    } catch (error) {
      showToast('Error declining vendor', 'error');
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminId');
    navigate('/admin-login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', class: 'status-pending' },
      approved: { text: 'Approved', class: 'status-approved' },
      declined: { text: 'Declined', class: 'status-declined' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const pendingCount = vendors.filter(v => v.status === 'pending').length;
  const approvedCount = vendors.filter(v => v.status === 'approved').length;
  const declinedCount = vendors.filter(v => v.status === 'declined').length;

  return (
    <div className="main-container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-value">{vendors.length}</div>
            <div className="stat-label">Total Vendors</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card stat-approved">
            <div className="stat-value">{approvedCount}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card stat-declined">
            <div className="stat-value">{declinedCount}</div>
            <div className="stat-label">Declined</div>
          </div>
        </div>

        <div className="admin-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({approvedCount})
          </button>
          <button
            className={`filter-btn ${filter === 'declined' ? 'active' : ''}`}
            onClick={() => setFilter('declined')}
          >
            Declined ({declinedCount})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <LoadingSpinner size="large" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No vendors found</h3>
            <p>No vendor applications match your filter.</p>
          </div>
        ) : (
          <div className="vendors-list">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="vendor-card">
                <div className="vendor-header">
                  <div>
                    <h3 className="vendor-business-name">{vendor.business_name}</h3>
                    <p className="vendor-owner">Owner: {vendor.owner_name}</p>
                  </div>
                  {getStatusBadge(vendor.status)}
                </div>

                <div className="vendor-details">
                  <div className="vendor-detail-item">
                    <strong>Email:</strong> {vendor.email}
                  </div>
                  <div className="vendor-detail-item">
                    <strong>Phone:</strong> {vendor.phone}
                  </div>
                  <div className="vendor-detail-item">
                    <strong>GST Number:</strong> {vendor.gst_number}
                  </div>
                  <div className="vendor-detail-item">
                    <strong>Address:</strong> {vendor.business_address}, {vendor.city}, {vendor.state} - {vendor.postal_code}
                  </div>
                  <div className="vendor-detail-item">
                    <strong>Applied on:</strong> {new Date(vendor.created_at).toLocaleDateString()}
                  </div>
                </div>

                {vendor.status === 'pending' && (
                  <div className="vendor-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(vendor.id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDecline(vendor.id)}
                    >
                      ✗ Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
