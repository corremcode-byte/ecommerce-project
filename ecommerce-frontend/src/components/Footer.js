import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-tibico">
      <div className="footer-container">
        {/* Top CTA */}
        <div className="footer-top-cta">
          <div className="footer-cta-content">
            <h3 className="footer-cta-title">Ready to transform your space?</h3>
            <Link to="/products" className="btn btn-primary" style={{ padding: '14px 36px' }}>
              Shop Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-column">
            <div className="footer-brand">
              <span className="footer-brand-icon">✦</span>
              <span className="footer-brand-name">FURNII</span>
            </div>
            <p className="footer-description">
              Premium furniture crafted with passion. Transforming spaces into experiences since 2020.
            </p>
            <div className="footer-social-inline">
              <button className="social-link-sm" aria-label="Instagram" onClick={() => {}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
              <button className="social-link-sm" aria-label="Twitter" onClick={() => {}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="social-link-sm" aria-label="LinkedIn" onClick={() => {}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Shop All</Link></li>
              <li><Link to="/products?category=seating">Seating</Link></li>
              <li><Link to="/products?category=tables">Tables</Link></li>
              <li><Link to="/products?category=storage">Storage</Link></li>
              <li><Link to="/products?category=bedroom">Bedroom</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-column">
            <h3 className="footer-title">Account</h3>
            <ul className="footer-links">
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/vendor-register">Sell on Furnii</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3 className="footer-title">Contact</h3>
            <div className="footer-address">
              <p>📍 Mumbai, Maharashtra, India</p>
              <p>📞 +91 1800-XXX-XXXX</p>
              <p>✉️ hello@furnii.com</p>
              <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Mon – Sat: 9:00 AM – 8:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-links-bottom">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/shipping">Shipping</Link>
              <Link to="/refund">Refund Policy</Link>
            </div>
            <p className="footer-copyright-text">
              © 2025 FURNII. All rights reserved. Crafted with ♥ in India.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
