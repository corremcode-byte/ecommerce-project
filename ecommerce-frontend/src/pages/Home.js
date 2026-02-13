import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = 'http://localhost:5001';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        const featured = data.data.filter(p => p.sale_price).slice(0, 4);
        const popular = data.data.slice(0, 8);
        setFeaturedProducts(featured);
        setPopularProducts(popular);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      name: 'Seating',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
      count: '150+ Products',
      link: '/products?category=seating'
    },
    {
      name: 'Tables',
      image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop',
      count: '80+ Products',
      link: '/products?category=tables'
    },
    {
      name: 'Storage',
      image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&h=600&fit=crop',
      count: '120+ Products',
      link: '/products?category=storage'
    },
    {
      name: 'Bedroom',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=600&fit=crop',
      count: '200+ Products',
      link: '/products?category=bedroom'
    }
  ];

  const features = [
    {
      icon: '✨',
      title: 'Premium Quality',
      description: 'Hand-selected furniture from trusted manufacturers'
    },
    {
      icon: '🚚',
      title: 'Free Delivery',
      description: 'Free shipping on orders above ₹10,000'
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: '100% secure payment processing'
    },
    {
      icon: '↩️',
      title: 'Easy Returns',
      description: '30-day hassle-free return policy'
    }
  ];

  // Get first featured product for hero display
  const heroProduct = featuredProducts[0] || popularProducts[0];

  return (
    <>
      {/* Hero Section - Tibico Style (Full Width) */}
      <section className="hero-section-tibico" aria-label="Hero section">
        <div className="hero-background-natural" aria-hidden="true"></div>
        <div className="hero-content-wrapper">
          <div className="hero-text-section">
            <h1 className="hero-title-large">Crafted with excellence. Designed for life.</h1>
            <p className="hero-description">
              <strong>DISCOVER THE UNIQUE POWER AND EXPERIENCE OF FURNII.</strong> Our premium furniture collection 
              is made from the finest materials, crafted by skilled artisans. No shortcuts, no compromises, 
              just authentic craftsmanship in every piece. Furnii furniture transforms your space and 
              supports your lifestyle, comfort, productivity, and your whole home's wellbeing.
            </p>
            <p className="hero-description" style={{ marginTop: '16px', marginBottom: '40px' }}>
              <strong>BECAUSE YOUR HOME MATTERS</strong>
            </p>
            <div className="hero-buttons-group">
              <Link to="/products" className="btn btn-natural-primary">
                Shop All Furniture
              </Link>
              <Link to="/products" className="btn btn-natural-secondary">
                Build a Room
              </Link>
            </div>
            <div className="trust-badge">
              <span className="trust-text">See our 1,801 reviews on</span>
              <span className="trust-logo">Trustpilot</span>
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
                  <div className="badge-icon">🛋️</div>
                  <div className="badge-text">CRAFTED 2025 IN INDIA</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="main-container">
      {/* Product Attributes Bar - Colorful */}
      <section className="product-attributes-section">
        <div className="attributes-bar">
          <span className="attribute-item">FERMENTED</span>
          <span className="attribute-separator">◆</span>
          <span className="attribute-item">RICH IN POSTBIOTICS: ORGANIC ACIDS, POLYPHENOLS, VITAMINS, GABA, ENZYMES & ANTIOXIDANTS</span>
          <span className="attribute-separator">◆</span>
          <span className="attribute-item">FREE FROM SUGAR, SWEETENERS, FLAVOURINGS & PRESERVATIVES</span>
          <span className="attribute-separator">◆</span>
          <span className="attribute-item">RICH IN PROBIOTICS</span>
          <span className="attribute-separator">◆</span>
          <span className="attribute-item">VEGAN, GLUTEN-FREE & DAIRY-FREE</span>
          <span className="attribute-separator">◆</span>
          <span className="attribute-item">ALL NATURAL</span>
          <span className="attribute-separator">◆</span>
          <span className="attribute-item">RAW & UNPASTEURISED</span>
          <span className="attribute-separator">◆</span>
          <span className="attribute-item">CRAFT FERMENTED</span>
        </div>
      </section>

      {/* Health Benefits Section - Circular Icons */}
      <section className="health-benefits-section">
        <div className="health-benefits-grid">
          {[
            { 
              icon: '🫀', 
              title: 'Gut Health', 
              desc: 'Craft-fermented probiotic furniture supports and rebalances your home environment daily' 
            },
            { 
              icon: '🛡️', 
              title: 'Immunity', 
              desc: 'Our premium-quality furniture helps support a strong, healthy living space naturally' 
            },
            { 
              icon: '⚖️', 
              title: 'Balance', 
              desc: 'Helps to rebalance your space and rebuilds a harmonious home environment' 
            },
            { 
              icon: '🌿', 
              title: 'Natural', 
              desc: '100% raw, plant-based, sustainable, eco-friendly furniture with authentic craftsmanship' 
            },
            { 
              icon: '⚡', 
              title: 'Energy', 
              desc: 'Quality design enhances comfort and productivity to support your daily energy' 
            }
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

      {/* Shop Our Range Section - With Filters */}
      <section className="shop-range-section">
        <div className="shop-range-container">
          <h2 className="shop-range-title">SHOP OUR RANGE</h2>
          <div className="shop-range-filters">
            <button className="filter-btn active">
              <span className="filter-text">All Products</span>
              <span className="filter-count">20</span>
            </button>
            <button className="filter-btn">
              <span className="filter-text">Mixed Boxes</span>
              <span className="filter-count">5</span>
            </button>
            <button className="filter-btn">
              <span className="filter-text">Fixed Boxes</span>
              <span className="filter-count">5</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section - Enhanced */}
      <section className="categories-section-enhanced">
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
                  <div className="category-overlay-gradient"></div>
                </div>
                <div className="category-content">
                  <h3 className="category-title-main">{category.name}</h3>
                  <h4 className="category-title-sub">{category.name.toUpperCase()}</h4>
                  <p className="category-count">{category.count}</p>
                </div>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="deals" className="section section-featured" aria-labelledby="deals-title">
        <div className="section-header">
          <h2 id="deals-title" className="section-title">Hot Deals This Week</h2>
          <Link to="/products" className="view-all">
            View all →
          </Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <LoadingSpinner size="large" />
            <p style={{ marginTop: '20px', color: '#64748b', fontWeight: 500 }}>Loading amazing products...</p>
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <AnimatedCard key={product.id} delay={index * 50}>
                <ProductCard product={product} />
              </AnimatedCard>
            ))}
          </div>
        )}
      </section>

      {/* Popular Products */}
      <section className="section section-popular" aria-labelledby="popular-title">
        <div className="section-header">
          <h2 id="popular-title" className="section-title">Popular Products</h2>
          <Link to="/products" className="view-all">
            View all →
          </Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <LoadingSpinner size="large" />
            <p style={{ marginTop: '20px', color: '#64748b', fontWeight: 500 }}>Loading popular products...</p>
          </div>
        ) : (
          <div className="products-grid">
            {popularProducts.map((product, index) => (
              <AnimatedCard key={product.id} delay={index * 50}>
                <ProductCard product={product} />
              </AnimatedCard>
            ))}
          </div>
        )}
      </section>

      {/* Core Values Section - Tibico Style */}
      <section className="core-values-section">
        <div className="core-values-header">
          <h2 className="core-values-title">Furnii's Core Values</h2>
          <p className="core-values-subtitle">
            Premium furniture crafted with whole materials and authentic techniques. 
            Quality and sustainability in every piece for real home transformation.
          </p>
        </div>
        <div className="core-values-grid">
          {[
            { icon: '🌿', title: 'Natural', desc: 'All natural materials' },
            { icon: '📚', title: 'Education', desc: 'Expert guidance you can trust' },
            { icon: '♻️', title: 'Renewable', desc: 'Made with sustainable resources' },
            { icon: '🌱', title: 'Sustainable', desc: 'Sustainability in every piece' },
            { icon: '✨', title: 'Function', desc: 'Designed for real function' },
            { icon: '🤝', title: 'Fairness', desc: 'Ethical manufacturing practices' },
            { icon: '⭐', title: 'Quality', desc: 'Total quality management' },
            { icon: '🏠', title: 'Local', desc: 'Materials sourced locally' }
          ].map((value, index) => (
            <AnimatedCard key={value.title} delay={index * 50}>
              <div className="core-value-card">
                <div className="core-value-icon">{value.icon}</div>
                <h3 className="core-value-title">{value.title}</h3>
                <p className="core-value-desc">{value.desc}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/products" className="btn btn-natural-primary">
            Discover Our Story
          </Link>
        </div>
      </section>

      {/* Customer Love Section */}
      <section className="customer-love-section">
        <div className="customer-love-content">
          <h2 className="customer-love-title">Our 40,000 Customers Love Us</h2>
          <p className="customer-love-subtitle">
            Real people, real results, naturally. Join our community of over 40,000 satisfied customers.
          </p>
          <div className="trustpilot-badge-large">
            <span className="trust-logo-large">Trustpilot</span>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Tibico Club Style */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2 className="newsletter-title">Furnii Club</h2>
          <p className="newsletter-subtitle">Sign up for 20% off your first order!</p>
          <p className="newsletter-description">
            Join our newsletter to be the first to know about new arrivals, exclusive promotions, and online-only deals.
          </p>
          <form className="newsletter-form">
            <div className="newsletter-checkbox">
              <input type="checkbox" id="newsletter-consent" />
              <label htmlFor="newsletter-consent">I agree to receive marketing emails</label>
            </div>
            <button type="submit" className="btn btn-newsletter">
              Sign-up
            </button>
          </form>
        </div>
      </section>
      </div>
    </>
  );
};

export default Home;
