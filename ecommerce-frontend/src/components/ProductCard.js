import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const price = product.sale_price || product.price;
  const original = product.sale_price ? product.price : null;
  const discount = original ? Math.round((1 - price / original) * 100) : 0;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please login to add to wishlist', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const result = await toggleWishlist(product.id);
      if (result.success) {
        showToast(
          result.added ? 'Added to wishlist ❤️' : 'Removed from wishlist',
          'success'
        );
      }
    } catch (error) {
      showToast(error.message || 'Error updating wishlist', 'error');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const result = await addToCart(product.id, 1);
      if (result.success) {
        showToast(`${product.name} added to cart! 🛒`, 'success');
      } else {
        showToast(result.message || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Error adding to cart', 'error');
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View ${product.name}`}
    >
      <div className="product-image-wrapper">
        {discount > 0 && (
          <div className="discount-badge" aria-label={`${discount}% off`}>
            -{discount}%
          </div>
        )}
        <button
          className={`wishlist-btn ${inWishlist ? 'in-wishlist' : ''}`}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {inWishlist ? '❤️' : '♡'}
        </button>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x400/1a1a1a/6c5ce7?text=${encodeURIComponent(product.name)}`;
          }}
        />
        {/* Quick Add Button */}
        <button
          className="quick-add-btn"
          onClick={handleAddToCart}
          aria-label={`Quick add ${product.name} to cart`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
          </svg>
          <span>Quick Add</span>
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">
          {product.description || 'Premium quality furniture piece'}
        </p>
        <div className="product-pricing">
          <div className="price-row">
            {original && (
              <span className="original-price">
                ₹{parseFloat(original).toLocaleString('en-IN')}
              </span>
            )}
            <span className="current-price">
              ₹{parseFloat(price).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
