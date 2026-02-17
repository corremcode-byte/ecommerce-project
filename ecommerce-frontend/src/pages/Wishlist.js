import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';

import { API_URL } from '../config';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { wishlistItems, loadWishlist } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, navigate, loadWishlist]);

  useEffect(() => {
    if (wishlistItems.length > 0) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlistItems]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        // Match wishlist items with products
        const wishlistProductIds = wishlistItems.map(item => item.product_id);
        const matchedProducts = data.data.filter(product => 
          wishlistProductIds.includes(product.id)
        );
        setProducts(matchedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="main-container">
        <div className="page-hero">
          <h1 className="page-title">My Wishlist</h1>
          <p className="page-subtitle">Your favorite products saved for later</p>
        </div>
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="page-hero">
        <h1 className="page-title">My Wishlist</h1>
        <p className="page-subtitle">Your favorite products saved for later</p>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">❤️</div>
          <h3>Your wishlist is empty</h3>
          <p>Start adding products to your wishlist to see them here!</p>
        </div>
      ) : (
        <div className="products-grid" role="list" aria-label="Wishlist products">
          {products.map((product) => (
            <div key={product.id} role="listitem">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
