import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav>
      <div className="nav-content">
        <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/products" className={isActive('/products') ? 'active' : ''}>
          All Products
        </Link>
        <Link to="/products?category=seating" className={location.search.includes('category=seating') ? 'active' : ''}>
          Seating
        </Link>
        <Link to="/products?category=tables" className={location.search.includes('category=tables') ? 'active' : ''}>
          Tables
        </Link>
        <Link to="/products?category=storage" className={location.search.includes('category=storage') ? 'active' : ''}>
          Storage
        </Link>
        <Link to="/products?category=bedroom" className={location.search.includes('category=bedroom') ? 'active' : ''}>
          Bedroom
        </Link>
        {isActive('/products') && (
          <Link to="/#deals" className={location.hash === '#deals' ? 'active' : ''}>
            Deals
          </Link>
        )}
        {isActive('/profile') && (
          <Link to="/profile" className="active">
            My Account
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
