import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config';
import PromotionalBanner from './PromotionalBanner';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchAbortRef = useRef(null);
  const navigate = useNavigate();

  // Detect vendor & admin sessions from localStorage
  const [vendorSession, setVendorSession] = useState(null);
  const [adminSession, setAdminSession] = useState(null);

  useEffect(() => {
    const checkSessions = () => {
      try {
        const v = localStorage.getItem('vendor');
        const a = localStorage.getItem('admin');
        setVendorSession(v ? JSON.parse(v) : null);
        setAdminSession(a ? JSON.parse(a) : null);
      } catch (e) {
        setVendorSession(null);
        setAdminSession(null);
      }
    };

    checkSessions();

    // Listen for storage changes (e.g. login/logout in another tab or within the app)
    window.addEventListener('storage', checkSessions);

    // Also poll periodically for same-tab changes
    const interval = setInterval(checkSessions, 1000);

    return () => {
      window.removeEventListener('storage', checkSessions);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // Don't close if clicking the hamburger button
        if (!event.target.closest('.mobile-menu-toggle')) {
          setMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Search suggestions (typeahead)
  useEffect(() => {
    const term = searchQuery.trim();

    if (term.length < 2) {
      setSearchSuggestions([]);
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        if (searchAbortRef.current) {
          searchAbortRef.current.abort();
        }
        const controller = new AbortController();
        searchAbortRef.current = controller;
        setSearchLoading(true);

        const res = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (data.success) {
          setSearchSuggestions(data.data || []);
        } else {
          setSearchSuggestions([]);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSearchSuggestions([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSuggestionClick = (product) => {
    setSearchQuery('');
    setSearchSuggestions([]);
    navigate(`/products/${product.id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
    setSearchSuggestions([]);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleVendorLogout = () => {
    localStorage.removeItem('vendor');
    localStorage.removeItem('vendorId');
    setVendorSession(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminId');
    setAdminSession(null);
    setDropdownOpen(false);
    navigate('/');
  };

  // Determine what role is active for the dropdown display
  const hasAnySession = isAuthenticated || vendorSession || adminSession;

  return (
    <>
      <PromotionalBanner />
      <header style={{ 
        background: scrolled ? 'var(--header-bg-scroll)' : 'var(--header-bg)',
        boxShadow: scrolled ? 'var(--header-shadow)' : 'none'
      }}>
        <div className="header-content">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            <Link to="/" className="logo" aria-label="Furnii Home">
              <span className="logo-icon" aria-hidden="true">✦</span>
              <span className="logo-text">FURNII</span>
            </Link>
          </div>

          <div className="search-bar">
            <form onSubmit={handleSearch} className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search for furniture, decor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" className="search-icon-btn" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              {searchQuery.trim().length >= 2 && (searchSuggestions.length > 0 || searchLoading) && (
                <div className="search-suggestions">
                  {searchLoading && (
                    <div className="search-suggestion-item search-suggestion-loading">
                      Searching…
                    </div>
                  )}
                  {!searchLoading && searchSuggestions.slice(0, 6).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="search-suggestion-item"
                      onClick={() => handleSuggestionClick(product)}
                    >
                      <span className="search-suggestion-name">{product.name}</span>
                      {product.category_name && (
                        <span className="search-suggestion-meta">
                          {product.category_name}
                        </span>
                      )}
                    </button>
                  ))}
                  {!searchLoading && searchSuggestions.length === 0 && (
                    <div className="search-suggestion-item search-suggestion-empty">
                      No matches found
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="header-actions">
            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {/* Sun Icon */}
              <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              {/* Moon Icon */}
              <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>

            <Link to="/wishlist" className="header-icon-btn" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </Link>

            <div className="header-dropdown" ref={dropdownRef}>
              <button
                className="header-icon-btn dropdown-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="Account menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {/* Show a small indicator dot if any session is active */}
                {hasAnySession && (
                  <span style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--neon-green)',
                    border: '2px solid var(--bg-primary)'
                  }} />
                )}
              </button>
              <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>

                {/* ═══ CUSTOMER SESSION ═══ */}
                {isAuthenticated && (
                  <>
                    <div style={{ 
                      padding: '12px 16px', 
                      color: 'var(--text-muted)', 
                      fontSize: '11px', 
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontFamily: 'Space Grotesk, monospace',
                      borderBottom: '1px solid var(--glass-border)'
                    }}>
                      👤 {user?.full_name?.split(' ')[0] || 'Customer'}
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      My Orders
                    </Link>
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Wishlist
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                      Logout (Customer)
                    </button>
                  </>
                )}

                {/* ═══ VENDOR SESSION ═══ */}
                {vendorSession && (
                  <>
                    {isAuthenticated && <div className="dropdown-divider" />}
                    <div style={{ 
                      padding: '12px 16px', 
                      color: 'var(--neon-green)', 
                      fontSize: '11px', 
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontFamily: 'Space Grotesk, monospace',
                      borderBottom: '1px solid var(--glass-border)'
                    }}>
                      🏪 Vendor: {vendorSession.business_name}
                    </div>
                    <Link to="/vendor-dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      📦 Vendor Dashboard
                    </Link>
                    <button className="dropdown-item" onClick={handleVendorLogout} style={{ color: 'var(--danger)' }}>
                      Logout (Vendor)
                    </button>
                  </>
                )}

                {/* ═══ ADMIN SESSION ═══ */}
                {adminSession && (
                  <>
                    {(isAuthenticated || vendorSession) && <div className="dropdown-divider" />}
                    <div style={{ 
                      padding: '12px 16px', 
                      color: 'var(--neon-orange)', 
                      fontSize: '11px', 
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontFamily: 'Space Grotesk, monospace',
                      borderBottom: '1px solid var(--glass-border)'
                    }}>
                      🔒 Admin: {adminSession.email}
                    </div>
                    <Link to="/admin-dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      ⚡ Admin Dashboard
                    </Link>
                    <button className="dropdown-item" onClick={handleAdminLogout} style={{ color: 'var(--danger)' }}>
                      Logout (Admin)
                    </button>
                  </>
                )}

                {/* ═══ NO SESSION — Show login options ═══ */}
                {!hasAnySession && (
                  <>
                    <Link to="/login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      ⚡ Sign In
                    </Link>
                    <Link to="/register" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      ✨ Create Account
                    </Link>
                    <div className="dropdown-divider" />
                    <Link to="/vendor-register" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      🏪 Become a Vendor
                    </Link>
                    <Link to="/vendor-login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      📦 Vendor Portal
                    </Link>
                    <div className="dropdown-divider" />
                    <Link to="/admin-login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      🔒 Admin
                    </Link>
                  </>
                )}

                {/* ═══ EXTRA LOGIN OPTIONS if some sessions missing ═══ */}
                {hasAnySession && (!isAuthenticated || !vendorSession || !adminSession) && (
                  <>
                    <div className="dropdown-divider" />
                    <div style={{ 
                      padding: '8px 16px', 
                      color: 'var(--text-muted)', 
                      fontSize: '10px', 
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontFamily: 'Space Grotesk, monospace'
                    }}>
                      Switch / Add Account
                    </div>
                    {!isAuthenticated && (
                      <Link to="/login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        👤 Sign In as Customer
                      </Link>
                    )}
                    {!vendorSession && (
                      <Link to="/vendor-login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        🏪 Sign In as Vendor
                      </Link>
                    )}
                    {!adminSession && (
                      <Link to="/admin-login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        🔒 Sign In as Admin
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>

            <Link to="/cart" className="header-icon-btn header-cart-btn" aria-label={`Cart, ${cartCount} items`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge-icon">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} ref={mobileMenuRef}>
          <div className="mobile-menu-content">
            <div className="mobile-search">
              <form onSubmit={handleSearch} className="search-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search for furniture, decor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search products"
                />
                <button type="submit" className="search-icon-btn" aria-label="Search">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
                {searchQuery.trim().length >= 2 && (searchSuggestions.length > 0 || searchLoading) && (
                  <div className="search-suggestions">
                    {searchLoading && (
                      <div className="search-suggestion-item search-suggestion-loading">
                        Searching…
                      </div>
                    )}
                    {!searchLoading && searchSuggestions.slice(0, 6).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="search-suggestion-item"
                        onClick={() => {
                          handleSuggestionClick(product);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <span className="search-suggestion-name">{product.name}</span>
                        {product.category_name && (
                          <span className="search-suggestion-meta">
                            {product.category_name}
                          </span>
                        )}
                      </button>
                    ))}
                    {!searchLoading && searchSuggestions.length === 0 && (
                      <div className="search-suggestion-item search-suggestion-empty">
                        No matches found
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="mobile-menu-links">
              <Link to="/" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/products" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                Products
              </Link>
              <Link to="/wishlist" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                Wishlist
              </Link>
              <Link to="/cart" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                Cart ({cartCount})
              </Link>

              {isAuthenticated && (
                <>
                  <div className="mobile-menu-divider" />
                  <Link to="/profile" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    My Profile
                  </Link>
                  <Link to="/orders" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                  <button className="mobile-menu-link" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ color: 'var(--danger)' }}>
                    Logout (Customer)
                  </button>
                </>
              )}

              {vendorSession && (
                <>
                  <div className="mobile-menu-divider" />
                  <div className="mobile-menu-label">Vendor: {vendorSession.business_name}</div>
                  <Link to="/vendor-dashboard" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    Vendor Dashboard
                  </Link>
                  <button className="mobile-menu-link" onClick={() => { handleVendorLogout(); setMobileMenuOpen(false); }} style={{ color: 'var(--danger)' }}>
                    Logout (Vendor)
                  </button>
                </>
              )}

              {adminSession && (
                <>
                  <div className="mobile-menu-divider" />
                  <div className="mobile-menu-label">Admin: {adminSession.email}</div>
                  <Link to="/admin-dashboard" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                  <button className="mobile-menu-link" onClick={() => { handleAdminLogout(); setMobileMenuOpen(false); }} style={{ color: 'var(--danger)' }}>
                    Logout (Admin)
                  </button>
                </>
              )}

              {!hasAnySession && (
                <>
                  <div className="mobile-menu-divider" />
                  <Link to="/login" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    Create Account
                  </Link>
                  <Link to="/vendor-register" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    Become a Vendor
                  </Link>
                  <Link to="/vendor-login" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    Vendor Portal
                  </Link>
                  <Link to="/admin-login" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
