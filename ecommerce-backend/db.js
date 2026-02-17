const mysql = require('mysql2');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Add SSL if required (for cloud databases like PlanetScale, Railway, etc.)
if (process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('planetscale') || process.env.DB_HOST?.includes('railway')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(poolConfig);

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('DB Config check:', {
      host: process.env.DB_HOST || 'MISSING',
      user: process.env.DB_USER || 'MISSING',
      database: process.env.DB_NAME || 'MISSING',
      password: process.env.DB_PASSWORD ? 'SET' : 'MISSING'
    });
  } else {
    console.log('✅ Database connected successfully!');
    connection.release();
  }
});

module.exports = pool.promise();
