const db = require('./db');

const createTables = async () => {
  try {
    console.log('Creating tables...');

    // NEW: Users table
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

    // NEW: Addresses table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // EXISTING: Categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        image VARCHAR(500),
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // EXISTING: Products table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // NEW: Cart table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY user_product (user_id, product_id)
      )
    `);

    // NEW: Wishlist table
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY user_product (user_id, product_id)
      )
    `);

    // NEW: Orders table
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL
      )
    `);

    // NEW: Order Items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ All tables created successfully!');
    console.log('   - users, addresses (NEW)');
    console.log('   - categories, products (EXISTING)');
    console.log('   - cart, wishlist (NEW)');
    console.log('   - orders, order_items (NEW)');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
};

const insertDummyData = async () => {
  try {
    console.log('Inserting dummy data...');

    // Insert Categories
    const categories = [
      ['Seating', 'seating', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400', null],
      ['Tables', 'tables', 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400', null],
      ['Storage', 'storage', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400', null],
      ['Dining Chairs', 'dining-chairs', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400', 1],
      ['Dining Tables', 'dining-tables', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400', 2],
    ];

    for (const cat of categories) {
      await db.query(
        'INSERT IGNORE INTO categories (name, slug, image, parent_id) VALUES (?, ?, ?, ?)',
        cat
      );
    }

    // Insert Products
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

    console.log('✅ Dummy data inserted successfully!');
    console.log('\n📊 Database is ready with:');
    console.log('   - 5 Categories');
    console.log('   - 8 Products');
    console.log('   - Users, Cart, Wishlist, Orders tables created (ready for use)');
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error.message);
  }
};

const initializeDatabase = async () => {
  await createTables();
  await insertDummyData();
  console.log('\n🎉 Database initialization complete!');
  process.exit(0);
};

initializeDatabase();