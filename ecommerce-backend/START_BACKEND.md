# 🚀 How to Start the Backend Server

## Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** - Make sure MySQL is installed and running

## Step-by-Step Instructions

### Step 1: Navigate to Backend Directory

```bash
cd ecommerce-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- cors
- dotenv
- nodemon (for development)

### Step 3: Configure Environment Variables

Create a `.env` file in the `ecommerce-backend` directory:

```bash
# Create .env file
touch .env
```

Add the following content to `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ecommerce_db
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password.

### Step 4: Set Up MySQL Database

1. **Start MySQL** (if not already running):
   - **Mac**: `brew services start mysql` or check System Preferences
   - **Windows**: Check Services or MySQL Workbench
   - **Linux**: `sudo systemctl start mysql`

2. **Create the database**:
   ```bash
   mysql -u root -p
   ```
   
   Then in MySQL prompt:
   ```sql
   CREATE DATABASE ecommerce_db;
   EXIT;
   ```

### Step 5: Initialize Database Tables

Run the initialization script to create all tables and insert dummy data:

```bash
node init-db.js
```

You should see:
```
✅ Tables created successfully!
✅ Dummy data inserted successfully!
🎉 Database initialization complete!
```

### Step 6: Start the Backend Server

**Option 1: Production Mode (Standard)**
```bash
npm start
```

**Option 2: Development Mode (Auto-reload on changes)**
```bash
npm run dev
```

### Step 7: Verify Server is Running

You should see:
```
✅ Database connected successfully!
🚀 Server running on http://localhost:5000
```

### Step 8: Test the API

Open your browser or use curl:

- Health check: http://localhost:5000/api/health
- Get products: http://localhost:5000/api/products
- Get categories: http://localhost:5000/api/categories

Or test with curl:
```bash
curl http://localhost:5000/api/products
```

## Quick Start (All Commands)

```bash
# 1. Navigate to backend
cd ecommerce-backend

# 2. Install dependencies
npm install

# 3. Create .env file (edit with your MySQL password)
# PORT=5000
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=ecommerce_db

# 4. Create database in MySQL
mysql -u root -p
# CREATE DATABASE ecommerce_db;
# EXIT;

# 5. Initialize database
node init-db.js

# 6. Start server
npm start
# or for development: npm run dev
```

## Troubleshooting

### ❌ "Database connection failed"

**Solution:**
1. Check MySQL is running:
   ```bash
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status mysql
   
   # Windows
   # Check Services panel
   ```

2. Verify your `.env` file has correct credentials
3. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

### ❌ "Port 5000 already in use"

**Solution:**
- Change PORT in `.env` file to a different port (e.g., 5001)
- Or stop the process using port 5000:
  ```bash
  # Mac/Linux
  lsof -ti:5000 | xargs kill
  
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### ❌ "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Database does not exist"

**Solution:**
```bash
# Create database
mysql -u root -p
CREATE DATABASE ecommerce_db;
EXIT;

# Then run initialization
node init-db.js
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | (required) |
| `DB_NAME` | Database name | `ecommerce_db` |

## API Endpoints

Once the server is running, these endpoints are available:

- `GET /api/health` - Health check
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/categories` - Get all categories
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/cart/:userId` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `GET /api/wishlist/:userId` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist
- `GET /api/orders/:userId` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/addresses/:userId` - Get user addresses
- `POST /api/addresses` - Add address

## Next Steps

Once the backend is running:

1. **Start the frontend** (in a new terminal):
   ```bash
   cd ecommerce-frontend
   npm install
   npm start
   ```

2. **Open the app**: http://localhost:3000

3. The React frontend will connect to the backend at http://localhost:5000

## Development Tips

- Use `npm run dev` for auto-reload during development
- Check server logs for errors
- Use MySQL Workbench or similar tools to view database
- Test API endpoints using Postman or curl

---

**✅ Backend is ready when you see:**
- ✅ Database connected successfully!
- 🚀 Server running on http://localhost:5000
