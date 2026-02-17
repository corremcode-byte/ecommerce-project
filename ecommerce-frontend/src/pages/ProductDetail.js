import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedCard from '../components/AnimatedCard';

import { API_URL } from '../config';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.data) {
        const foundProduct = data.data.find(p => p.id === parseInt(id));
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          showToast('Product not found', 'error');
          setTimeout(() => navigate('/products'), 2000);
        }
      } else {
        showToast('Error loading product', 'error');
        setTimeout(() => navigate('/products'), 2000);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      showToast('Error loading product. Please check if backend is running.', 'error');
      setTimeout(() => navigate('/products'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      const result = await addToCart(product.id, quantity);
      if (result.success) {
        showToast(`${product.name} (${quantity}x) added to cart!`, 'success');
      } else {
        showToast(result.message || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Error adding to cart', 'error');
    }
  };

  const handleWishlistToggle = async () => {
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

  if (loading) {
    return (
      <div className="main-container">
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <LoadingSpinner size="large" />
          <p style={{ marginTop: '24px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="main-container">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Product not found</h3>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn btn-primary">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const price = product.sale_price || product.price;
  const original = product.sale_price ? product.price : null;
  const discount = original ? Math.round((1 - price / original) * 100) : 0;
  const inWishlist = isInWishlist(product.id);

  // Create image array (using main image for now, can be extended)
  const productImages = [product.image];

  return (
    <div className="main-container">
      <div className="product-detail-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products">Products</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail-layout">
          {/* Product Images */}
          <div className="product-detail-images">
            <AnimatedCard delay={0}>
              <div className="product-main-image">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="product-detail-image"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name)}`;
                  }}
                />
                {discount > 0 && (
                  <div className="discount-badge-large" aria-label={`${discount}% off`}>
                    {discount}% OFF
                  </div>
                )}
                <button
                  className={`wishlist-btn-large ${inWishlist ? 'in-wishlist' : ''}`}
                  onClick={handleWishlistToggle}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {inWishlist ? '❤️' : '♡'}
                </button>
              </div>
            </AnimatedCard>
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <AnimatedCard delay={100}>
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-detail-pricing">
                <div className="price-row-detail">
                  <span className="price-label">Regular price</span>
                  {original && (
                    <span className="original-price-large">
                      ₹{parseFloat(original).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="price-row-detail">
                  <span className="price-label">Sale price</span>
                  <span className="current-price-large">
                    ₹{parseFloat(price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="price-per-item-detail">item / per</div>
              </div>

              {product.description && (
                <div className="product-detail-description">
                  <h3 className="detail-section-title">Description</h3>
                  <p>{product.description}</p>
                </div>
              )}

              <div className="product-detail-stock">
                <span className={`stock-badge ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock_quantity > 0 
                    ? `✓ ${product.stock_quantity} in stock` 
                    : 'Out of stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              {product.stock_quantity > 0 && (
                <div className="quantity-selector-detail">
                  <label className="quantity-label">Quantity:</label>
                  <div className="quantity-controls-detail">
                    <button
                      className="qty-btn-detail"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-display-detail">{quantity}</span>
                    <button
                      className="qty-btn-detail"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="product-detail-actions">
                <button
                  className="btn btn-primary btn-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  aria-label={`Add ${product.name} to cart`}
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  className="btn btn-secondary btn-buy-now"
                  onClick={() => {
                    if (isAuthenticated) {
                      handleAddToCart();
                      setTimeout(() => navigate('/checkout'), 500);
                    } else {
                      showToast('Please login to continue', 'error');
                      setTimeout(() => navigate('/login'), 1500);
                    }
                  }}
                  disabled={product.stock_quantity === 0}
                >
                  Buy Now
                </button>
              </div>

              {/* Product Features */}
              <div className="product-features">
                <div className="feature-item">
                  <span className="feature-icon">🚚</span>
                  <span className="feature-text">Free delivery over ₹10,000</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">↩️</span>
                  <span className="feature-text">30-day return policy</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💳</span>
                  <span className="feature-text">Secure payment</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">Authentic quality</span>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
