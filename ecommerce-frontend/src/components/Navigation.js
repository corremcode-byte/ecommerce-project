import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path) || location.search.includes(path.split('=')[1] || '');
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'All Products' },
    { path: '/products?category=seating', label: 'Seating' },
    { path: '/products?category=tables', label: 'Tables' },
    { path: '/products?category=storage', label: 'Storage' },
    { path: '/products?category=bedroom', label: 'Bedroom' },
  ];

  return (
    <nav>
      <div className="nav-content">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={isActive(item.path) && (item.path === '/' ? location.pathname === '/' : true) ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
