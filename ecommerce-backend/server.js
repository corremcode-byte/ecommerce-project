const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Handle preflight OPTIONS requests first - MUST be before CORS middleware
app.options('*', (req, res) => {
  console.log('OPTIONS preflight request received:', req.path);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// Middleware - CORS Configuration
// Allow all origins for now (restrict in production if needed)
app.use(cors({
  origin: '*', // Explicitly allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']?.substring(0, 50)
  });
  next();
});

// Add CORS headers manually as backup - MUST be before any routes
app.use((req, res, next) => {
  // Always set CORS headers on every response
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight explicitly
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight for:', req.path);
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Password helper functions
const hashPassword = (password) => Buffer.from(password).toString('base64');
const verifyPassword = (password, hash) => Buffer.from(password).toString('base64') === hash;

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, full_name, mobile, phone, date_of_birth } = req.body;
    
    // Use phone if mobile is not provided (for frontend compatibility)
    const userMobile = mobile || phone;
    
    // Auto-generate username from email if not provided
    let finalUsername = username;
    if (!finalUsername && email) {
      // Generate username from email (part before @)
      finalUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      // Add random number to ensure uniqueness
      finalUsername = finalUsername + Math.floor(Math.random() * 10000);
    }
    
    if (!finalUsername) {
      return res.status(400).json({ success: false, message: 'Username or email is required' });
    }
    
    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, finalUsername]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email or username already exists' });
    }
    
    const hashedPassword = hashPassword(password);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, full_name, mobile, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
      [finalUsername, email, hashedPassword, full_name, userMobile, date_of_birth]
    );
    const [user] = await db.query('SELECT id, username, email, full_name, mobile, date_of_birth FROM users WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: user[0], message: 'Registration successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0 || !verifyPassword(password, users[0].password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    delete users[0].password;
    res.json({ success: true, data: { ...users[0], role: 'user' }, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// VENDOR ROUTES
// ============================================

app.post('/api/vendor/register', async (req, res) => {
  try {
    const { email, password, business_name, owner_name, gst_number, business_address, city, state, postal_code, phone } = req.body;
    
    if (!email || !password || !business_name || !owner_name || !gst_number || !business_address || !city || !state || !postal_code || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Check if vendor already exists
    const [existing] = await db.query('SELECT id FROM vendors WHERE email = ? OR gst_number = ?', [email, gst_number]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Vendor with this email or GST number already exists' });
    }
    
    const hashedPassword = hashPassword(password);
    await db.query(
      'INSERT INTO vendors (email, password, business_name, owner_name, gst_number, business_address, city, state, postal_code, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, business_name, owner_name, gst_number, business_address, city, state, postal_code, phone, 'pending']
    );
    
    res.json({ success: true, message: 'Vendor registration submitted! Your application is pending approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset vendor password
app.post('/api/vendor/reset-password', async (req, res) => {
  try {
    const { email, new_password } = req.body;
    if (!email || !new_password) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }
    const [vendors] = await db.query('SELECT id FROM vendors WHERE email = ?', [email]);
    if (vendors.length === 0) {
      return res.status(404).json({ success: false, message: 'No vendor found with this email' });
    }
    const hashedPassword = hashPassword(new_password);
    await db.query('UPDATE vendors SET password = ? WHERE email = ?', [hashedPassword, email]);
    res.json({ success: true, message: 'Password reset successfully! You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/vendor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [vendors] = await db.query('SELECT * FROM vendors WHERE email = ?', [email]);
    
    if (vendors.length === 0) {
      return res.status(401).json({ success: false, message: 'No vendor account found with this email' });
    }
    
    if (!verifyPassword(password, vendors[0].password)) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please check your password and try again.' });
    }
    
    const vendor = vendors[0];
    
    if (vendor.status === 'declined') {
      return res.status(403).json({ success: false, message: 'Your vendor application has been declined. Please contact support.' });
    }
    
    if (vendor.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your vendor application is pending approval. Please wait for admin approval.' });
    }
    
    delete vendor.password;
    res.json({ success: true, data: { ...vendor, role: 'vendor' }, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    
    if (admins.length === 0 || !verifyPassword(password, admins[0].password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const admin = admins[0];
    delete admin.password;
    res.json({ success: true, data: { ...admin, role: 'admin' }, message: 'Login successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/vendors', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT id, email, business_name, owner_name, gst_number, business_address, city, state, postal_code, phone, status, created_at FROM vendors';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [vendors] = await db.query(query, params);
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/vendors/:id/approve', async (req, res) => {
  try {
    await db.query('UPDATE vendors SET status = ? WHERE id = ?', ['approved', req.params.id]);
    res.json({ success: true, message: 'Vendor approved successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/vendors/:id/decline', async (req, res) => {
  try {
    await db.query('UPDATE vendors SET status = ? WHERE id = ?', ['declined', req.params.id]);
    res.json({ success: true, message: 'Vendor declined successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// VENDOR PRODUCT ROUTES
// ============================================

app.post('/api/vendor/products', async (req, res) => {
  try {
    const { vendor_id, name, description, price, sale_price, category_id, image, stock_quantity, is_featured } = req.body;
    
    if (!vendor_id || !name || !price || !category_id) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }
    
    // Verify vendor is approved
    const [vendor] = await db.query('SELECT status FROM vendors WHERE id = ?', [vendor_id]);
    if (vendor.length === 0 || vendor[0].status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Vendor not approved' });
    }
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    const [result] = await db.query(
      'INSERT INTO products (name, slug, description, price, sale_price, category_id, image, stock_quantity, is_featured, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, price, sale_price, category_id, image, stock_quantity || 0, is_featured || false, vendor_id]
    );
    
    const [product] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: product[0], message: 'Product added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/vendor/products/:vendorId', async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.vendor_id = ? ORDER BY p.created_at DESC',
      [req.params.vendorId]
    );
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/vendor/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { vendor_id, name, description, price, sale_price, category_id, image, stock_quantity, is_featured } = req.body;

    if (!vendor_id || !name || !price || !category_id) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const [existing] = await db.query('SELECT id, vendor_id FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    if (existing[0].vendor_id !== parseInt(vendor_id)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own products' });
    }

    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, sale_price = ?, category_id = ?, image = ?, stock_quantity = ?, is_featured = ? WHERE id = ?',
      [name, description, parseFloat(price), sale_price ? parseFloat(sale_price) : null, category_id, image || null, parseInt(stock_quantity) || 0, !!is_featured, productId]
    );
    const [product] = await db.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [productId]);
    res.json({ success: true, data: product[0], message: 'Product updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/vendor/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const vendorId = req.query.vendor_id;
    if (!vendorId) return res.status(400).json({ success: false, message: 'vendor_id is required' });

    const [existing] = await db.query('SELECT id, vendor_id FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    if (existing[0].vendor_id !== parseInt(vendorId)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own products' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ success: true, message: 'Product deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PROFILE ROUTES
// ============================================

app.get('/api/profile/:userId', async (req, res) => {
  try {
    const [user] = await db.query('SELECT id, username, email, full_name, mobile, date_of_birth FROM users WHERE id = ?', [req.params.userId]);
    if (user.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    const [addresses] = await db.query('SELECT * FROM addresses WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true, data: { ...user[0], addresses } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/profile/:userId', async (req, res) => {
  try {
    const { full_name, mobile, date_of_birth } = req.body;
    await db.query('UPDATE users SET full_name = ?, mobile = ?, date_of_birth = ? WHERE id = ?', [full_name, mobile, date_of_birth, req.params.userId]);
    const [user] = await db.query('SELECT id, username, email, full_name, mobile, date_of_birth FROM users WHERE id = ?', [req.params.userId]);
    res.json({ success: true, data: user[0], message: 'Profile updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADDRESS ROUTES
// ============================================

app.post('/api/addresses', async (req, res) => {
  try {
    const { user_id, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;
    if (is_default) await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [user_id]);
    const [result] = await db.query('INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, address_line1, address_line2, city, state, postal_code, country, is_default || 0]);
    const [address] = await db.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    res.json({ success: true, data: address[0], message: 'Address added!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/addresses/:userId', async (req, res) => {
  try {
    const [addresses] = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.params.userId]);
    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/addresses/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM addresses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Address deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// CART ROUTES
// ============================================

app.get('/api/cart/:userId', async (req, res) => {
  try {
    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.slug, p.price, p.sale_price, p.image, p.stock_quantity,
       (CASE WHEN p.sale_price IS NOT NULL THEN p.sale_price ELSE p.price END) * c.quantity as subtotal
       FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`, [req.params.userId]);
    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    res.json({ success: true, data: { items: cartItems, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    const [product] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product[0].stock_quantity < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });
    
    const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    if (existing.length > 0) {
      const newQuantity = existing[0].quantity + quantity;
      if (product[0].stock_quantity < newQuantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });
      await db.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?', [newQuantity, user_id, product_id]);
    } else {
      await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity]);
    }
    res.json({ success: true, message: 'Added to cart!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/cart/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await db.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
      return res.json({ success: true, message: 'Item removed!' });
    }
    await db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ success: true, message: 'Cart updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/cart/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Item removed!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// WISHLIST ROUTES
// ============================================

app.get('/api/wishlist/:userId', async (req, res) => {
  try {
    const [items] = await db.query(
      `SELECT w.id, w.product_id, w.created_at,
       p.name, p.slug, p.description, p.price, p.sale_price, p.image, p.stock_quantity, p.is_featured,
       c.name AS category_name
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.params.userId]
    );
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/wishlist', async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    
    // Check if already in wishlist
    const [existing] = await db.query(
      'SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );
    
    if (existing.length > 0) {
      return res.json({ success: false, message: 'Already in wishlist' });
    }
    
    await db.query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [user_id, product_id]
    );
    
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/wishlist/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM wishlist WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ORDER ROUTES
// ============================================

app.post('/api/orders', async (req, res) => {
  try {
    const { user_id, shipping_address_id, payment_method, cart_items } = req.body;
    const total = cart_items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const orderNumber = 'ORD' + Date.now();
    
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, order_number, total_amount, payment_method, shipping_address_id, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, orderNumber, total, payment_method, shipping_address_id, 'Processing', 'Completed']);
    
    const orderId = orderResult.insertId;
    for (const item of cart_items) {
      await db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]);
      await db.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
    }
    await db.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
    
    res.json({ success: true, data: { order_id: orderId, order_number: orderNumber }, message: 'Order placed!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/orders/:userId', async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, a.address_line1, a.city, a.state, a.postal_code
       FROM orders o LEFT JOIN addresses a ON o.shipping_address_id = a.id
       WHERE o.user_id = ? ORDER BY o.created_at DESC`, [req.params.userId]);
    
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image FROM order_items oi
         JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`, [order.id]);
      order.items = items;
    }
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/orders/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Update order status to cancelled
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['Cancelled', orderId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PRODUCT & CATEGORY ROUTES
// ============================================

app.get('/api/home', async (req, res) => {
  try {
    const [featuredProducts] = await db.query(
      'SELECT * FROM products WHERE is_featured = 1 LIMIT 8'
    );
    const [categories] = await db.query('SELECT * FROM categories WHERE parent_id IS NULL');
    
    res.json({
      success: true,
      data: {
        featuredProducts,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const [category] = await db.query(
      'SELECT * FROM categories WHERE slug = ?',
      [req.params.slug]
    );
    
    if (category.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, data: category[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    // Ensure database is initialized before querying
    try {
      await ensureInitialized();
    } catch (initError) {
      console.error('❌ Database initialization failed:', initError);
      return res.status(500).json({
        success: false,
        message: 'Database initialization failed. Please try POST /api/init-db to initialize manually.',
        error: initError.message,
        hint: 'The database tables may not exist. Try calling POST /api/init-db first.'
      });
    }
    
    const { category, featured, limit } = req.query;
    
    // Base query - try with vendor join first, fallback to simple query
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];
    
    // Check if vendor_id column exists and add vendor join if it does
    try {
      await db.query('SELECT vendor_id FROM products LIMIT 1');
      // Column exists, use query with vendor join
      query = 'SELECT p.*, c.name as category_name, v.business_name as vendor_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN vendors v ON p.vendor_id = v.id WHERE 1=1';
    } catch (e) {
      // vendor_id column doesn't exist, use simple query (already set above)
      console.log('Using simple query (vendor_id column not found)');
    }
    
    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    
    if (featured === 'true') {
      query += ' AND p.is_featured = 1';
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const [products] = await db.query(query, params);
    
    // Explicitly set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.json({ success: true, data: products || [] });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      } : undefined
    });
  }
});

app.get('/api/products/:id/can-review', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const userId = req.query.user_id;
    if (isNaN(productId) || !userId) {
      return res.json({ success: true, canReview: false });
    }
    const [rows] = await db.query(
      `SELECT 1 FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'Cancelled'
       LIMIT 1`,
      [userId, productId]
    );
    res.json({ success: true, canReview: rows.length > 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) return res.status(400).json({ success: false, message: 'Invalid product id' });
    const [reviews] = await db.query(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.full_name AS user_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );
    const [avg] = await db.query(
      'SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS total FROM reviews WHERE product_id = ?',
      [productId]
    );
    res.json({
      success: true,
      data: reviews,
      summary: { average: Number(avg[0].avg_rating), total: avg[0].total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;
    if (!user_id || !product_id || rating == null) {
      return res.status(400).json({ success: false, message: 'user_id, product_id and rating are required' });
    }
    const r = Math.round(Number(rating));
    if (r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const [purchased] = await db.query(
      `SELECT 1 FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status != 'Cancelled' LIMIT 1`,
      [user_id, product_id]
    );
    if (purchased.length === 0) {
      return res.status(403).json({ success: false, message: 'Only customers who have purchased this product can leave a review.' });
    }
    await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)',
      [user_id, product_id, r, comment || null]
    );
    const [rows] = await db.query(
      `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, u.full_name AS user_name
       FROM reviews r LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.user_id = ? ORDER BY r.created_at DESC LIMIT 1`,
      [product_id, user_id]
    );
    res.json({ success: true, data: rows[0], message: 'Review submitted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const [product] = await db.query(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?',
      [req.params.slug]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, data: product[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/similar-products/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) return res.status(400).json({ success: false, message: 'Invalid product id' });
    const [productRow] = await db.query('SELECT category_id FROM products WHERE id = ?', [productId]);
    if (!productRow.length) return res.json({ success: true, data: [] });

    const categoryId = productRow[0].category_id;
    const limit = 4;
    let similar = [];

    if (categoryId != null) {
      const [byCategory] = await db.query(
        'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? AND p.id != ? ORDER BY p.created_at DESC LIMIT ?',
        [categoryId, productId, limit]
      );
      similar = byCategory;
    }

    if (similar.length < limit) {
      const excludeIds = [productId, ...similar.map(p => p.id)];
      const placeholders = excludeIds.map(() => '?').join(',');
      const [others] = await db.query(
        `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id NOT IN (${placeholders}) ORDER BY p.created_at DESC LIMIT ?`,
        [...excludeIds, limit - similar.length]
      );
      similar = [...similar, ...others];
    }

    res.json({ success: true, data: similar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }
    
    const [products] = await db.query(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? LIMIT 20',
      [`%${q}%`, `%${q}%`]
    );
    
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    success: true, 
    message: 'FURNII Backend API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/register, /api/auth/login',
      vendor: '/api/vendor/register, /api/vendor/login',
      admin: '/api/admin/login',
      products: '/api/products',
      cart: '/api/cart/:userId',
      wishlist: '/api/wishlist/:userId',
      orders: '/api/orders/:userId'
    }
  });
});

// Simple ping endpoint (no DB required)
app.get('/api/ping', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    success: true, 
    message: 'Backend is alive!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'none',
    method: req.method,
    path: req.path
  });
});

// Simple CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    success: true, 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running!' });
});

// Manual database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    await ensureInitialized();
    res.json({ 
      success: true, 
      message: 'Database initialized successfully!' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database initialization failed',
      error: error.message
    });
  }
});

// Database connectivity test
app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      dbConfig: {
        host: process.env.DB_HOST ? '***configured***' : 'missing',
        user: process.env.DB_USER ? '***configured***' : 'missing',
        database: process.env.DB_NAME ? '***configured***' : 'missing',
        password: process.env.DB_PASSWORD ? '***configured***' : 'missing',
        ssl: process.env.DB_SSL || 'not set'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message,
      errorCode: error.code,
      dbConfig: {
        host: process.env.DB_HOST || 'NOT SET',
        user: process.env.DB_USER || 'NOT SET',
        database: process.env.DB_NAME || 'NOT SET',
        password: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
        ssl: process.env.DB_SSL || 'NOT SET'
      }
    });
  }
});

// Simple products test (minimal query)
app.get('/api/products-test', async (req, res) => {
  try {
    const [products] = await db.query('SELECT COUNT(*) as count FROM products');
    res.json({ 
      success: true, 
      message: 'Products table accessible',
      productCount: products[0]?.count || 0
    });
  } catch (error) {
    console.error('Products test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Products table query failed',
      error: error.message,
      errorCode: error.code
    });
  }
});

// ============================================
// DATABASE INITIALIZATION
// ============================================

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Create tables WITHOUT foreign keys first (to avoid dependency issues)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        mobile VARCHAR(20),
        date_of_birth DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created users table');

    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image VARCHAR(500),
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created categories table');

    await db.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        gst_number VARCHAR(50) NOT NULL UNIQUE,
        business_address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created vendors table');

    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created admins table');

    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2),
        category_id INT,
        image VARCHAR(500),
        stock_quantity INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        vendor_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created products table');

    // Now add foreign keys
    try {
      await db.query('ALTER TABLE categories ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL');
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.query('ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL');
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.query('ALTER TABLE products MODIFY COLUMN image TEXT');
    } catch (e) { /* allow long image URLs / data URLs */ }
    try {
      await db.query('ALTER TABLE products ADD CONSTRAINT fk_products_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL');
    } catch (e) {
      // Foreign key might already exist or vendor_id column doesn't exist yet
      try {
        await db.query('ALTER TABLE products ADD COLUMN vendor_id INT');
        await db.query('ALTER TABLE products ADD CONSTRAINT fk_products_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL');
      } catch (e2) {
        // Already exists
      }
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'India',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created addresses table');

    try {
      await db.query('ALTER TABLE addresses ADD CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    } catch (e) {
      // Foreign key might already exist
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_product (user_id, product_id)
      )
    `);
    console.log('✅ Created cart table');

    try {
      await db.query('ALTER TABLE cart ADD CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      await db.query('ALTER TABLE cart ADD CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');
    } catch (e) {
      // Foreign keys might already exist
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_product (user_id, product_id)
      )
    `);
    console.log('✅ Created wishlist table');

    try {
      await db.query('ALTER TABLE wishlist ADD CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      await db.query('ALTER TABLE wishlist ADD CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');
    } catch (e) {
      // Foreign keys might already exist
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        user_id INT NOT NULL,
        rating TINYINT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_product_review (user_id, product_id)
      )
    `);
    console.log('✅ Created reviews table');

    try {
      await db.query('ALTER TABLE reviews ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');
      await db.query('ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    } catch (e) {
      // Foreign keys might already exist
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'Pending',
        shipping_address_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created orders table');

    try {
      await db.query('ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
      await db.query('ALTER TABLE orders ADD CONSTRAINT fk_orders_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL');
    } catch (e) {
      // Foreign keys might already exist
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created order_items table');

    try {
      await db.query('ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE');
      await db.query('ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE');
    } catch (e) {
      // Foreign keys might already exist
    }

    console.log('✅ All tables created/verified');

    // Insert sample data
    const categories = [
      ['Seating', 'seating', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400', null],
      ['Tables', 'tables', 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400', null],
      ['Storage', 'storage', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400', null],
      ['Lighting', 'lighting', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400', null],
      ['Decor', 'decor', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', null],
      ['Chocolates', 'chocolates', 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400', null],
      ['Sweets & Gifts', 'sweets-gifts', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400', null],
      ['Beverages', 'beverages', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', null],
      ['Dining Chairs', 'dining-chairs', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400', 1],
      ['Dining Tables', 'dining-tables', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400', 2],
      ['Beds', 'beds', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400', 1],
      ['Desks', 'desks', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400', 2],
    ];

    for (const cat of categories) {
      await db.query(
        'INSERT IGNORE INTO categories (name, slug, image, parent_id) VALUES (?, ?, ?, ?)',
        cat
      );
    }

    const products = [
      ['Modern Dining Chair', 'modern-dining-chair', 'Elegant and comfortable dining chair with solid wood frame', 15000, 13500, 4, 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400', 50, true],
      ['Walnut Study Table', 'walnut-study-table', 'Minimalist study table with rich walnut finish', 28000, null, 2, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400', 15, true],
      ['6-Seater Dining Table', 'six-seater-dining-table', 'Spacious dining table perfect for family gatherings', 35000, null, 5, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400', 10, true],
      ['Wooden Bookshelf', 'wooden-bookshelf', 'Industrial style bookshelf with metal frame', 18000, 16000, 3, 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400', 30, false],
      ['Leather Sofa Set', 'leather-sofa-set', 'Luxurious 3-seater leather sofa', 65000, 59000, 1, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 8, true],
      ['Coffee Table', 'coffee-table', 'Modern coffee table with glass top', 12000, null, 2, 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400', 25, false],
      ['Office Chair', 'office-chair', 'Ergonomic office chair with lumbar support', 8500, 7500, 1, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', 40, false],
      ['Wardrobe Cabinet', 'wardrobe-cabinet', 'Spacious wardrobe with sliding doors', 45000, null, 3, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400', 12, true],
    ];

    for (const product of products) {
      await db.query(
        'INSERT IGNORE INTO products (name, slug, description, price, sale_price, category_id, image, stock_quantity, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        product
      );
    }

    // Insert Admin Account
    const adminPassword = Buffer.from('Correm@001').toString('base64');
    await db.query(
      'INSERT IGNORE INTO admins (email, password, name) VALUES (?, ?, ?)',
      ['admin@mail.com', adminPassword, 'Admin User']
    );

    console.log('✅ Database initialized with sample data');
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    // Re-throw so we can see the error
    throw error;
  }
};

// Run initialization (will run on first request in Vercel, or on startup locally)
let initPromise = null;
let initError = null;
const ensureInitialized = async () => {
  if (!initPromise && !initError) {
    initPromise = initializeDatabase().catch(err => {
      initError = err;
      console.error('❌ Initialization failed, will retry on next request');
      throw err;
    });
  }
  if (initError) {
    // Retry initialization if it failed before
    initError = null;
    initPromise = initializeDatabase().catch(err => {
      initError = err;
      throw err;
    });
  }
  return initPromise;
};

// Initialize on module load (for Vercel serverless, this runs on first cold start)
ensureInitialized().catch(err => {
  console.error('Initial initialization failed, will retry on first request');
});

// ============================================
// START SERVER
// ============================================

// Only listen when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Database connected successfully!`);
    console.log(`📡 API endpoints available:`);
    console.log(`   - Authentication: /api/auth/register, /api/auth/login`);
    console.log(`   - Vendor: /api/vendor/register, /api/vendor/login`);
    console.log(`   - Admin: /api/admin/login, /api/admin/vendors`);
    console.log(`   - Products: /api/products`);
    console.log(`   - Cart: /api/cart/:userId`);
    console.log(`   - Wishlist: /api/wishlist/:userId`);
    console.log(`   - Orders: /api/orders/:userId`);
    console.log(`   - Profile: /api/profile/:userId`);
  });
}

// Catch-all route for debugging (should be last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/cors-test',
      'GET /api/test-db',
      'GET /api/products',
      'POST /api/init-db',
      'POST /api/auth/register',
      'POST /api/auth/login'
    ]
  });
});

// Export for Vercel serverless
module.exports = app;
