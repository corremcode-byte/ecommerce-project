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
          result.added ? 'Added to wishlist' : 'Removed from wishlist',
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
        showToast(`${product.name} added to cart!`, 'success');
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

  // Generate colorful background based on product index
  const colorVariants = [
    'linear-gradient(135deg, rgba(240, 253, 244, 0.8) 0%, rgba(220, 252, 231, 0.6) 100%)',
    'linear-gradient(135deg, rgba(255, 251, 235, 0.8) 0%, rgba(254, 243, 199, 0.6) 100%)',
    'linear-gradient(135deg, rgba(255, 241, 242, 0.8) 0%, rgba(254, 226, 226, 0.6) 100%)',
    'linear-gradient(135deg, rgba(237, 242, 247, 0.8) 0%, rgba(226, 232, 240, 0.6) 100%)',
    'linear-gradient(135deg, rgba(240, 253, 244, 0.8) 0%, rgba(220, 252, 231, 0.6) 100%)',
    'linear-gradient(135deg, rgba(255, 251, 235, 0.8) 0%, rgba(254, 243, 199, 0.6) 100%)',
    'linear-gradient(135deg, rgba(255, 241, 242, 0.8) 0%, rgba(254, 226, 226, 0.6) 100%)',
    'linear-gradient(135deg, rgba(237, 242, 247, 0.8) 0%, rgba(226, 232, 240, 0.6) 100%)'
  ];
  
  const cardColor = colorVariants[product.id % colorVariants.length];

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
      style={{
        animationDelay: '0s',
        animation: 'scaleIn 0.6s ease-out',
        background: cardColor
      }}
    >
      <div className="product-image-wrapper">
        {discount > 0 && (
          <div className="discount-badge" aria-label={`${discount}% off`}>
            {discount}% OFF
          </div>
        )}
        <button
          className={`wishlist-btn ${inWishlist ? 'in-wishlist' : ''}`}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWishlist}
        >
          {inWishlist ? '❤️' : '♡'}
        </button>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name)}`;
          }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">
          {product.description || 'Premium quality furniture piece'}
        </p>
        <div className="product-pricing">
          <div className="price-row">
            <span className="price-label">Regular price</span>
            {original && (
              <span className="original-price" aria-label={`Original price: ₹${parseFloat(original).toLocaleString('en-IN')}`}>
                ₹{parseFloat(original).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div className="price-row">
            <span className="price-label">Sale price</span>
            <span className="current-price" aria-label={`Price: ₹${parseFloat(price).toLocaleString('en-IN')}`}>
              ₹{parseFloat(price).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="price-per-item">
            item / per
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
