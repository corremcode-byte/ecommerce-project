import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { wishlistItems, loadWishlist, loading } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, navigate, loadWishlist]);

  // Backend returns wishlist rows with product_id, name, slug, price, sale_price, image, stock_quantity.
  // Shape them as product objects so ProductCard works and order is preserved.
  const products = useMemo(() => {
    return wishlistItems.map((item) => ({
      id: item.product_id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      sale_price: item.sale_price,
      image: item.image,
      stock_quantity: item.stock_quantity,
      description: item.description || '',
      category_name: item.category_name || '',
      is_featured: item.is_featured || false
    }));
  }, [wishlistItems]);

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
