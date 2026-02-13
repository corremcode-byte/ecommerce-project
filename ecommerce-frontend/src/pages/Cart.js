import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../components/Toast';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loadCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to view your cart', 'error');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      loadCart();
    }
  }, [isAuthenticated, navigate, loadCart, showToast]);

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    setLoading(true);
    const result = await updateQuantity(cartItemId, newQuantity);
    if (result.success) {
      showToast('Cart updated', 'success');
    } else {
      showToast(result.message || 'Error updating quantity', 'error');
    }
    setLoading(false);
  };

  const handleRemoveItem = async (cartItemId) => {
    if (window.confirm('Remove this item from cart?')) {
      setLoading(true);
      const result = await removeFromCart(cartItemId);
      if (result.success) {
        showToast('Item removed from cart', 'success');
      } else {
        showToast(result.message || 'Error removing item', 'error');
      }
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    navigate('/checkout');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (cartItems.length === 0) {
    return (
      <div className="main-container">
        <div className="page-hero">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">Review your items before checkout</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to your cart to see them here!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="page-hero">
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">Review your items before checkout</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items-section">
          {cartItems.map((item) => {
            const price = item.sale_price || item.price;
            return (
              <div key={item.id} className="cart-item-card">
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120';
                  }}
                />
                <div className="cart-item-details">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <p className="cart-item-price">
                    ₹{parseFloat(price).toLocaleString('en-IN')}
                  </p>
                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={loading || item.quantity <= 1}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span className="qty-display" aria-label={`Quantity: ${item.quantity}`}>
                      {item.quantity}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={loading}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <p className="cart-item-total" aria-label={`Subtotal: ₹${parseFloat(item.subtotal).toLocaleString('en-IN')}`}>
                    ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="btn-remove-small"
                    disabled={loading}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary-section">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cartItems.length} items):</span>
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
              onClick={handleCheckout}
              className="btn btn-primary btn-full"
              disabled={loading}
              aria-label="Proceed to checkout"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/products"
              className="btn btn-secondary btn-full"
              style={{ marginTop: '12px' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
