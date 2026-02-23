import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    if (path === '/products') {
      return pathname === '/products' && !categoryParam && !pathname.match(/^\/products\/\d+$/);
    }
    const pathCategory = path.startsWith('/products?category=') ? path.split('category=')[1] : null;
    if (pathCategory) return pathname === '/products' && categoryParam === pathCategory;
    return false;
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
            className={isActive(item.path) ? 'active' : ''}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
