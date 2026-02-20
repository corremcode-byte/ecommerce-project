import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

import { API_URL } from '../config';

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    category_id: '',
    image: '',
    stock_quantity: '',
    is_featured: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Check if vendor is logged in
    const storedVendor = localStorage.getItem('vendor');
    if (!storedVendor) {
      navigate('/vendor-login');
      return;
    }

    try {
      const vendorData = JSON.parse(storedVendor);
      setVendor(vendorData);
      loadCategories();
      loadProducts(vendorData.id);
    } catch (error) {
      console.error('Error parsing vendor data:', error);
      navigate('/vendor-login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (vendorId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/vendor/products/${vendorId}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      sale_price: '',
      category_id: '',
      image: '',
      stock_quantity: '',
      is_featured: false
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      sale_price: product.sale_price ? String(product.sale_price) : '',
      category_id: String(product.category_id),
      image: product.image || '',
      stock_quantity: String(product.stock_quantity ?? ''),
      is_featured: !!product.is_featured
    });
    setEditingProduct(product.id);
    setShowProductForm(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...productForm,
      vendor_id: vendor.id,
      price: parseFloat(productForm.price),
      sale_price: productForm.sale_price ? parseFloat(productForm.sale_price) : null,
      stock_quantity: parseInt(productForm.stock_quantity) || 0,
      category_id: parseInt(productForm.category_id)
    };

    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `${API_URL}/api/vendor/products/${editingProduct}` : `${API_URL}/api/vendor/products`;
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        showToast(isEdit ? 'Product updated successfully!' : 'Product added successfully!', 'success');
        resetProductForm();
        loadProducts(vendor.id);
      } else {
        showToast(data.message || (isEdit ? 'Failed to update product' : 'Failed to add product'), 'error');
      }
    } catch (error) {
      showToast(editingProduct ? 'Error updating product' : 'Error adding product', 'error');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      const response = await fetch(`${API_URL}/api/vendor/products/${product.id}?vendor_id=${vendor.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        showToast('Product deleted successfully!', 'success');
        setDeleteConfirm(null);
        loadProducts(vendor.id);
      } else {
        showToast(data.message || 'Failed to delete product', 'error');
      }
    } catch (error) {
      showToast('Error deleting product', 'error');
      console.error('Error:', error);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select an image file (JPEG, PNG, etc.)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProductForm(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogout = () => {
    localStorage.removeItem('vendor');
    localStorage.removeItem('vendorId');
    navigate('/vendor-login');
  };

  if (!vendor) {
    return (
      <div className="main-container">
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="vendor-dashboard">
        <div className="vendor-header">
          <div>
            <h1 className="vendor-dashboard-title">Vendor Dashboard</h1>
            <p className="vendor-business-info">{vendor.business_name}</p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="vendor-stats">
          <div className="stat-card">
            <div className="stat-value">{products.length}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card stat-featured">
            <div className="stat-value">{products.filter(p => p.is_featured).length}</div>
            <div className="stat-label">Featured Products</div>
          </div>
        </div>

        <div className="vendor-actions-bar">
          <button
            className="btn btn-primary btn-large"
            onClick={() => (showProductForm ? resetProductForm() : setShowProductForm(true))}
          >
            {showProductForm ? '✗ Cancel' : '+ Upload Product'}
          </button>
        </div>

        {showProductForm && (
          <div className="product-form-container">
            <h2 className="form-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleProductSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    required
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category_id"
                    className="form-input"
                    required
                    value={productForm.category_id}
                    onChange={handleProductFormChange}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-input form-textarea"
                  rows="4"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  placeholder="Enter product description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Price (₹)</label>
                  <input
                    type="number"
                    name="sale_price"
                    className="form-input"
                    min="0"
                    step="0.01"
                    value={productForm.sale_price}
                    onChange={handleProductFormChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    className="form-input"
                    min="0"
                    value={productForm.stock_quantity}
                    onChange={handleProductFormChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div className="form-image-options">
                  <input
                    type="url"
                    name="image"
                    className="form-input"
                    value={productForm.image}
                    onChange={handleProductFormChange}
                    placeholder="Paste image URL (e.g. https://example.com/image.jpg)"
                  />
                  <label className="btn btn-secondary btn-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                    📷 Upload photo
                  </label>
                </div>
                {productForm.image && (
                  <>
                    <p className="form-label form-image-link-label">Image link / preview:</p>
                    <div className="form-image-preview-row">
                      <img
                        src={productForm.image}
                        alt="Preview"
                        className="form-image-preview"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="form-image-link">
                        <span className="form-image-link-text" title={productForm.image}>
                          {productForm.image.startsWith('data:') ? 'Uploaded image (data)' : productForm.image}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={productForm.is_featured}
                    onChange={handleProductFormChange}
                  />
                  <span>Feature this product</span>
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
              >
                {submitting ? (editingProduct ? 'Updating...' : 'Adding Product...') : (editingProduct ? 'Update Product' : 'Add Product')}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <LoadingSpinner size="large" />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products yet</h3>
            <p>Start by uploading your first product!</p>
          </div>
        ) : (
          <div className="vendor-products-grid">
            {products.map((product) => (
              <div key={product.id} className="vendor-product-card">
                <img
                  src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={product.name}
                  className="vendor-product-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                <div className="vendor-product-info">
                  <h3 className="vendor-product-name">{product.name}</h3>
                  <p className="vendor-product-category">{product.category_name}</p>
                  <div className="vendor-product-pricing">
                    <span className="vendor-product-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                    {product.sale_price && (
                      <span className="vendor-product-sale">₹{parseFloat(product.sale_price).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <div className="vendor-product-stock">
                    Stock: {product.stock_quantity}
                  </div>
                  {product.is_featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                  <div className="vendor-product-actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEditProduct(product)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(product)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content vendor-delete-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete product?</h3>
              <p>“{deleteConfirm.name}” will be permanently deleted. This cannot be undone.</p>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDeleteProduct(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
