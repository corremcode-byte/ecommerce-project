import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';

import { API_URL } from '../config';

const Checkout = () => {
  const { userId, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, loadCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to checkout', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your cart is empty!', 'error');
      setTimeout(() => navigate('/cart'), 1500);
      return;
    }

    loadCheckoutData();
  }, [isAuthenticated, navigate, showToast, cartItems.length, loadCart]);

  const loadCheckoutData = async () => {
    try {
      const addressResponse = await fetch(`${API_URL}/api/addresses/${userId}`);
      const addressResult = await addressResponse.json();

      if (addressResult.success && addressResult.data.length > 0) {
        setAddresses(addressResult.data);
        const defaultAddr = addressResult.data.find(a => a.is_default) || addressResult.data[0];
        setSelectedAddress(defaultAddr.id);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      showToast('Failed to load checkout data', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          shipping_address_id: selectedAddress,
          payment_method: paymentMethod,
          cart_items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.sale_price || item.price
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderNumber(data.data.order_number);
        setShowSuccessModal(true);
        loadCart(); // Refresh cart
      } else {
        showToast(data.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      showToast('Error placing order', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'Cash on Delivery', icon: '💵', name: 'Cash on Delivery', desc: 'Pay when you receive' },
    { value: 'Credit Card', icon: '💳', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex' },
    { value: 'UPI', icon: '📱', name: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
    { value: 'Net Banking', icon: '🏦', name: 'Net Banking', desc: 'All major banks' },
    { value: 'Wallet', icon: '👛', name: 'Wallet', desc: 'Paytm, Amazon Pay' }
  ];

  if (!isAuthenticated || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="main-container">
      <div className="page-hero">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Complete your purchase</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-left">
          {/* Delivery Address Section */}
          <div className="checkout-card">
            <h3 className="checkout-card-title">📍 Delivery Address</h3>
            {addresses.length === 0 ? (
              <div className="empty-notice">
                <p>📍 No delivery address found</p>
                <Link to="/profile" className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Add Address
                </Link>
              </div>
            ) : (
              <>
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`address-radio-card ${addr.id === selectedAddress ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={addr.id === selectedAddress}
                      onChange={() => setSelectedAddress(addr.id)}
                      aria-label={`Select address: ${addr.address_line1}`}
                    />
                    <div className="address-radio-content">
                      {addr.is_default && (
                        <span className="default-badge">Default</span>
                      )}
                      <p className="address-name"><strong>{addr.address_line1}</strong></p>
                      {addr.address_line2 && (
                        <p className="address-text">{addr.address_line2}</p>
                      )}
                      <p className="address-text">
                        {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <p className="address-text">{addr.country}</p>
                    </div>
                  </label>
                ))}
                <Link to="/profile" className="link-button">
                  + Add New Address
                </Link>
              </>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="checkout-card">
            <h3 className="checkout-card-title">💳 Payment Method</h3>
            <div className="payment-grid">
              {paymentMethods.map((method) => (
                <label key={method.value} className="payment-card">
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    aria-label={`Select payment method: ${method.name}`}
                  />
                  <div className="payment-content">
                    <span className="payment-icon" aria-hidden="true">{method.icon}</span>
                    <div>
                      <div className="payment-name">{method.name}</div>
                      <div className="payment-desc">{method.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="checkout-right">
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item.id} className="summary-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="summary-item-img"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60';
                    }}
                  />
                  <div className="summary-item-details">
                    <p className="summary-item-name">{item.name}</p>
                    <p className="summary-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="summary-item-price">
                    ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{parseFloat(cartTotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span className="free-text">FREE</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>₹{parseFloat(cartTotal).toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              className="btn btn-primary btn-full"
              disabled={loading || !selectedAddress || addresses.length === 0}
              aria-label="Place order"
            >
              {loading ? (
                <>
                  <span className="loading-spinner" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal" style={{ display: 'flex' }} role="dialog" aria-labelledby="success-title">
          <div className="modal-content success-modal">
            <div className="success-icon" aria-hidden="true">✅</div>
            <h2 id="success-title" className="success-title">Order Placed Successfully!</h2>
            <p className="success-message">Order Number: {orderNumber}</p>
            <button onClick={() => navigate('/orders')} className="btn btn-primary">
              View My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
