import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import PromotionalBanner from './PromotionalBanner';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleSearchClick = (e) => {
    e?.preventDefault();
    navigate('/products');
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <PromotionalBanner />
      <header>
        <div className="header-content">
        <Link to="/" className="logo" aria-label="Furnii Home">
          <span className="logo-icon" aria-hidden="true">🛋️</span>
          <span className="logo-text">Furnii</span>
        </Link>

        <div className="search-bar">
          <form onSubmit={handleSearch} className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search for furniture, decor, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              aria-label="Search products"
            />
            <button
              type="submit"
              className="search-icon-btn"
              aria-label="Search"
            >
              🔍
            </button>
          </form>
        </div>

        <div className="header-actions">
          <button
            className="header-icon-btn"
            onClick={handleSearchClick}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6"/>
              <path d="m17 17-4-4"/>
            </svg>
          </button>
          
          <div className="header-dropdown" ref={dropdownRef}>
            <button
              className="header-icon-btn dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                <path d="M10 14c-4 0-7.5 2-7.5 4.5V20h15v-1.5c0-2.5-3.5-4.5-7.5-4.5z"/>
              </svg>
            </button>
            <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Sign Up
                  </Link>
                  <Link to="/login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    My Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    My Orders
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          <Link to="/cart" className="header-icon-btn header-cart-btn" aria-label={`Shopping cart, ${cartCount} items`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l.5 2M7 3h10l-2 10H5L3 3zm0 0v2m0 0h14M5 15h14M5 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge-icon" aria-label={`${cartCount} items in cart`}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
