const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Password helper functions
const hashPassword = (password) => Buffer.from(password).toString('base64');
const verifyPassword = (password, hash) => Buffer.from(password).toString('base64') === hash;

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, full_name, mobile, date_of_birth } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'User already exists' });
    
    const hashedPassword = hashPassword(password);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, full_name, mobile, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, full_name, mobile, date_of_birth]
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
    res.json({ success: true, data: users[0], message: 'Login successful!' });
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
      `SELECT w.id, w.product_id, p.name, p.slug, p.price, p.sale_price, p.image, p.stock_quantity
       FROM wishlist w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_id = ?`, 
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
    const { category, featured, limit } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];
    
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
    res.json({ success: true, data: products });
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

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running!' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Database connected successfully!`);
  console.log(`📡 API endpoints available:`);
  console.log(`   - Authentication: /api/auth/register, /api/auth/login`);
  console.log(`   - Products: /api/products`);
  console.log(`   - Cart: /api/cart/:userId`);
  console.log(`   - Wishlist: /api/wishlist/:userId`);
  console.log(`   - Orders: /api/orders/:userId`);
  console.log(`   - Profile: /api/profile/:userId`);
});
