import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = 'http://localhost:5001';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('All Products');
  const [pageSubtitle, setPageSubtitle] = useState('Discover our complete collection of premium furniture');

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();

      if (data.success) {
        let filtered = data.data;
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        if (category) {
          const categoryMap = {
            seating: ['chair', 'sofa', 'seat'],
            tables: ['table', 'desk'],
            storage: ['shelf', 'bookshelf', 'storage', 'cabinet'],
            bedroom: ['bed', 'bedroom', 'mattress']
          };

          const searchTerms = categoryMap[category] || [category];
          filtered = filtered.filter(p => {
            const productName = p.name.toLowerCase();
            return searchTerms.some(term => productName.includes(term));
          });

          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
          setPageTitle(categoryTitle);
          setPageSubtitle(`Browse our ${categoryTitle.toLowerCase()} collection`);
        } else if (search) {
          const searchTerm = search.toLowerCase().trim();
          filtered = filtered.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const descMatch = product.description && product.description.toLowerCase().includes(searchTerm);
            const categoryMatch = product.category_name && product.category_name.toLowerCase().includes(searchTerm);
            return nameMatch || descMatch || categoryMatch;
          });

          setPageTitle(`Search: "${search}"`);
          setPageSubtitle(`Found ${filtered.length} product${filtered.length !== 1 ? 's' : ''}`);
        } else {
          setPageTitle('All Products');
          setPageSubtitle('Discover our complete collection of premium furniture');
        }

        setProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="page-hero">
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <LoadingSpinner size="large" />
          <p style={{ marginTop: '24px', color: '#64748b', fontWeight: 500, fontSize: '18px' }}>
            Discovering amazing products...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">🔍</div>
          <h3>No products found</h3>
          <p>Try a different search or browse all products</p>
        </div>
      ) : (
        <div className="products-grid" role="list" aria-label="Product list">
          {products.map((product, index) => (
            <AnimatedCard key={product.id} delay={index * 50} role="listitem">
              <ProductCard product={product} />
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
