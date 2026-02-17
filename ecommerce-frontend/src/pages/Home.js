import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';

import { API_URL } from '../config';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const url = `${API_URL}/api/products`;
      console.log('Fetching products from:', url);
      console.log('API_URL:', API_URL);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);

      if (data.success) {
        const featured = data.data.filter(p => p.sale_price).slice(0, 4);
        const popular = data.data.slice(0, 8);
        setFeaturedProducts(featured);
        setPopularProducts(popular);
      } else {
        console.error('API returned error:', data.message);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      });
      
      // Show user-friendly error
      if (error.message.includes('Failed to fetch')) {
        console.error('⚠️ Network error - Backend might be down or CORS issue');
        console.error('Try visiting:', `${API_URL}/api/health`);
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      name: 'Seating',
      subtitle: 'Sofas & Chairs',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',
      count: '150+',
      link: '/products?category=seating',
      color: '#6c5ce7'
    },
    {
      name: 'Tables',
      subtitle: 'Dining & Work',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop',
      count: '80+',
      link: '/products?category=tables',
      color: '#00cec9'
    },
    {
      name: 'Storage',
      subtitle: 'Shelves & Cabinets',
      image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&h=600&fit=crop',
      count: '120+',
      link: '/products?category=storage',
      color: '#e17055'
    },
    {
      name: 'Bedroom',
      subtitle: 'Beds & Nightstands',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
      count: '200+',
      link: '/products?category=bedroom',
      color: '#fd79a8'
    }
  ];

  const stats = [
    { value: '40K+', label: 'Happy Customers' },
    { value: '500+', label: 'Premium Products' },
    { value: '50+', label: 'Expert Artisans' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const heroProduct = featuredProducts[0] || popularProducts[0];

  return (
    <>
      {/* ═══ HERO — Cinematic ═══ */}
      <section className="hero-section-tibico">
        <div className="hero-content-wrapper">
          <div className="hero-text-section">
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              NEW COLLECTION 2025
            </div>
            <h1 className="hero-title-large">
              Design your<br />
              <span className="hero-gradient-text">dream space</span>
            </h1>
            <p className="hero-description">
              Handcrafted furniture built for those who appreciate the art of living. 
              Every piece tells a story of passion, precision, and timeless elegance.
            </p>
            <div className="hero-buttons-group">
              <Link to="/products" className="btn btn-primary">
                <span>Explore Collection</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/products" className="btn btn-secondary">
                View Lookbook
              </Link>
            </div>

            {/* Stats Row */}
            <div className="hero-stats-row">
              {stats.map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <span className="hero-stat-value">{stat.value}</span>
                  <span className="hero-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-image-section">
            {heroProduct && (
              <div className="hero-product-display">
                <img 
                  src={heroProduct.image} 
                  alt={heroProduct.name}
                  className="hero-product-image"
                />
                <div className="hero-product-badge">
                  <div className="badge-icon">✦</div>
                  <div className="badge-text">Handcrafted 2025</div>
                </div>
                {/* Floating accent circles */}
                <div className="hero-accent-circle hero-accent-1" />
                <div className="hero-accent-circle hero-accent-2" />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="main-container">
        {/* ═══ MARQUEE BAR ═══ */}
        <section className="product-attributes-section">
          <div className="attributes-bar">
            {['HANDCRAFTED', 'SUSTAINABLE', 'PREMIUM MATERIALS', 'ARTISAN MADE', 'ECO FRIENDLY', 'LIFETIME WARRANTY', 'FREE SHIPPING', 'MADE IN INDIA'].map((attr, i) => (
              <React.Fragment key={attr}>
                <span className="attribute-item">{attr}</span>
                {i < 7 && <span className="attribute-separator">◆</span>}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ═══ WHY FURNII — Feature Cards ═══ */}
        <section className="health-benefits-section">
          <div className="section-header" style={{ marginBottom: '48px' }}>
            <h2 className="section-title">Why Furnii?</h2>
          </div>
          <div className="health-benefits-grid">
            {[
              { icon: '🎨', title: 'Design Led', desc: 'Every piece is thoughtfully designed by world-class designers' },
              { icon: '🛡️', title: 'Built to Last', desc: 'Premium materials & construction that stands the test of time' },
              { icon: '🌿', title: 'Sustainable', desc: 'Responsibly sourced materials with eco-friendly manufacturing' },
              { icon: '🚚', title: 'Free Delivery', desc: 'Complimentary white-glove delivery on all orders over ₹10K' },
              { icon: '↩️', title: '30-Day Returns', desc: 'Not satisfied? Return hassle-free within 30 days' }
            ].map((benefit, index) => (
              <AnimatedCard key={benefit.title} delay={index * 100}>
                <div className="health-benefit-card">
                  <div className="health-benefit-icon">{benefit.icon}</div>
                  <h3 className="health-benefit-title">{benefit.title}</h3>
                  <p className="health-benefit-desc">{benefit.desc}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* ═══ SHOP BY CATEGORY — Bento Grid ═══ */}
        <section className="categories-section-enhanced">
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="view-all">View all →</Link>
          </div>
          <div className="categories-grid-enhanced">
            {categories.map((category, index) => (
              <AnimatedCard key={category.name} delay={index * 100}>
                <Link
                  to={category.link}
                  className="category-card-enhanced"
                  aria-label={`Browse ${category.name}`}
                >
                  <div className="category-image-wrapper">
                    <img src={category.image} alt={category.name} className="category-image" />
                    <div className="category-overlay-gradient" />
                  </div>
                  <div className="category-content">
                    <span className="category-count">{category.count} Products</span>
                    <h3 className="category-title-main">{category.name}</h3>
                    <h4 className="category-title-sub">{category.subtitle}</h4>
                  </div>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* ═══ HOT DEALS ═══ */}
        <section className="section section-featured">
          <div className="section-header">
            <div>
              <h2 className="section-title">Hot Deals 🔥</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>Limited time offers you don't want to miss</p>
            </div>
            <Link to="/products" className="view-all">View all →</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <LoadingSpinner size="large" />
              <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontWeight: 500 }}>Loading products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product, index) => (
                <AnimatedCard key={product.id} delay={index * 80}>
                  <ProductCard product={product} />
                </AnimatedCard>
              ))}
            </div>
          )}
        </section>

        {/* ═══ SHOP RANGE FILTERS ═══ */}
        <section className="shop-range-section">
          <div className="shop-range-container">
            <h2 className="shop-range-title">SHOP OUR RANGE</h2>
            <div className="shop-range-filters">
              {[
                { label: 'All Products', count: '20', key: 'all' },
                { label: 'Best Sellers', count: '8', key: 'best' },
                { label: 'New Arrivals', count: '5', key: 'new' },
                { label: 'On Sale', count: '7', key: 'sale' },
              ].map(filter => (
                <button
                  key={filter.key}
                  className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  <span className="filter-text">{filter.label}</span>
                  <span className="filter-count">{filter.count}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ POPULAR PRODUCTS ═══ */}
        <section className="section section-popular">
          <div className="section-header">
            <div>
              <h2 className="section-title">Popular Right Now</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>What our customers love most</p>
            </div>
            <Link to="/products" className="view-all">View all →</Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="products-grid">
              {popularProducts.map((product, index) => (
                <AnimatedCard key={product.id} delay={index * 60}>
                  <ProductCard product={product} />
                </AnimatedCard>
              ))}
            </div>
          )}
        </section>

        {/* ═══ SOCIAL PROOF ═══ */}
        <section className="customer-love-section">
          <AnimatedCard>
            <div className="customer-love-content">
              <span className="customer-love-tag">TRUSTED BY THOUSANDS</span>
              <h2 className="customer-love-title">40,000+ Happy Customers</h2>
              <p className="customer-love-subtitle">
                Join our growing community of design lovers who've transformed their spaces with Furnii.
              </p>
              <div className="trustpilot-badge-large">
                <span className="trust-logo-large">★★★★★</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '12px', fontSize: '14px' }}>4.9/5 on Trustpilot</span>
              </div>
            </div>
          </AnimatedCard>
        </section>

        {/* ═══ CORE VALUES ═══ */}
        <section className="core-values-section">
          <div className="core-values-header">
            <span className="core-values-tag">OUR PHILOSOPHY</span>
            <h2 className="core-values-title">Crafted with Purpose</h2>
            <p className="core-values-subtitle">
              We believe great furniture should be beautiful, sustainable, and built to last generations.
            </p>
          </div>
          <div className="core-values-grid">
            {[
              { icon: '🌿', title: 'Natural', desc: 'All natural materials, ethically sourced' },
              { icon: '♻️', title: 'Renewable', desc: 'Sustainable resources, zero waste' },
              { icon: '✨', title: 'Artisan', desc: 'Handcrafted by skilled artisans' },
              { icon: '🏠', title: 'Local', desc: 'Proudly made in India' },
            ].map((value, index) => (
              <AnimatedCard key={value.title} delay={index * 80}>
                <div className="core-value-card">
                  <div className="core-value-icon">{value.icon}</div>
                  <h3 className="core-value-title">{value.title}</h3>
                  <p className="core-value-desc">{value.desc}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>

        {/* ═══ NEWSLETTER ═══ */}
        <section className="newsletter-section">
          <div className="newsletter-content">
            <span className="newsletter-tag">JOIN THE CLUB</span>
            <h2 className="newsletter-title">Furnii Club</h2>
            <p className="newsletter-subtitle">Get 20% off your first order</p>
            <p className="newsletter-description">
              Be the first to know about new arrivals, exclusive promotions, and design inspiration.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-email-input"
                />
                <button type="submit" className="btn btn-primary newsletter-submit-btn">
                  Subscribe
                </button>
              </div>
              <div className="newsletter-checkbox">
                <input type="checkbox" id="newsletter-consent" />
                <label htmlFor="newsletter-consent">I agree to receive marketing emails</label>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
