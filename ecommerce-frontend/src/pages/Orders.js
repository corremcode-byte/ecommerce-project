import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

import { API_URL } from '../config';

const Orders = () => {
  const { userId, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to view your orders', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, showToast]);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${userId}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderToCancel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Order cancelled successfully', 'success');
        setShowCancelModal(false);
        setOrderToCancel(null);
        loadOrders();
      } else {
        showToast(data.message || 'Failed to cancel order', 'error');
      }
    } catch (error) {
      showToast('Error cancelling order', 'error');
      console.error('Error:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'pending',
      processing: 'processing',
      completed: 'completed',
      cancelled: 'cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'pending';
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="main-container">
        <div className="page-hero">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track and manage your orders</p>
        </div>
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="main-container">
        <div className="page-hero">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track and manage your orders</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="page-hero">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">Track and manage your orders</p>
      </div>

      <div>
        {orders.map((order) => (
          <div key={order.id} className="order-card-modern">
            <div className="order-header-modern">
              <div>
                <div className="order-number">Order #{order.order_number}</div>
                <div className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div className="order-info-right">
                <span className={`status-badge-modern ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                  <button
                    onClick={() => {
                      setOrderToCancel(order);
                      setShowCancelModal(true);
                    }}
                    className="btn-cancel-order"
                    aria-label={`Cancel order ${order.order_number}`}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            <div className="order-items-modern">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item-modern">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="order-item-img"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80';
                    }}
                  />
                  <div className="order-item-info">
                    <p className="order-item-name">{item.name}</p>
                    <p className="order-item-details">
                      Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer-modern">
              <div className="order-address-modern">
                <strong>Delivery Address:</strong>
                <p>{order.shipping_address}</p>
              </div>
              <div className="order-payment-modern">
                <strong>Payment:</strong>
                <p>{order.payment_method}</p>
              </div>
              <div className="order-total-modern">
                <div className="order-total-label">Total Amount</div>
                <div className="order-total-amount">
                  ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal" style={{ display: 'flex' }} role="dialog" aria-labelledby="cancel-title">
          <div className="modal-content confirm-modal">
            <h3 id="cancel-title" className="modal-title">Cancel Order?</h3>
            <p className="modal-text">Are you sure you want to cancel this order?</p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setOrderToCancel(null);
                }}
                className="btn btn-secondary"
              >
                No, Keep Order
              </button>
              <button onClick={handleCancelOrder} className="btn btn-primary">
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
