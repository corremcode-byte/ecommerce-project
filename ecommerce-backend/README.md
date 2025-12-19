# 🛒 Ecommerce Website Setup Guide

Complete step-by-step guide to set up your ecommerce website with MySQL backend and Next.js frontend.

---

## 📁 Project Structure

```
your-project/
├── ecommerce-backend/     ← Backend (Node.js + Express + MySQL)
└── ecommerce-frontend/    ← Frontend (Next.js + React + TypeScript)
```

---

## 🔧 PART 1: BACKEND SETUP (MySQL + Express)

### Step 1: Install MySQL

**Windows:**
1. Download MySQL from: https://dev.mysql.com/downloads/installer/
2. Install MySQL Community Server
3. During installation, set root password (remember this!)
4. Install MySQL Workbench (optional, for GUI)

**Mac:**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Step 2: Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE ecommerce_db;
```

To verify:
```sql
SHOW DATABASES;
```

### Step 3: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd ecommerce-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Edit the `.env` file and update with your MySQL credentials:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
   DB_NAME=ecommerce_db
   ```

4. **Initialize database (create tables + dummy data):**
   ```bash
   node init-db.js
   ```
   
   You should see:
   ```
   ✅ Tables created successfully!
   ✅ Dummy data inserted successfully!
   🎉 Database initialization complete!
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   Server should start on: http://localhost:5000

### Step 4: Test Backend API

Open browser or use curl to test:
- http://localhost:5000/api/health
- http://localhost:5000/api/products
- http://localhost:5000/api/categories

---

## 💻 PART 2: FRONTEND SETUP (Next.js)

### Step 1: Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd ecommerce-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify environment variables:**
   
   Check `.env.local` file contains:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend should start on: http://localhost:3000

### Step 2: Open in Browser

Visit: http://localhost:3000

You should see:
- ✅ Navigation bar with links
- ✅ Hero section
- ✅ Categories section
- ✅ Featured products

---

## 🧪 TESTING ALL FEATURES

### Test Navigation:

1. **Home Page** (http://localhost:3000)
   - Should show hero banner
   - Should show categories
   - Should show featured products

2. **Products Page** (http://localhost:3000/products)
   - Should show all 8 products
   - Each product should have image, name, price

3. **Categories Page** (http://localhost:3000/categories)
   - Should show 5 categories
   - Should show subcategories for some

4. **About Page** (http://localhost:3000/about)
   - Should show company information

5. **Profile Page** (http://localhost:3000/profile)
   - Should show dummy user profile

### Test API Endpoints:

```bash
# Get all products
curl http://localhost:5000/api/products

# Get all categories
curl http://localhost:5000/api/categories

# Search products
curl http://localhost:5000/api/search?q=chair

# Get home page data
curl http://localhost:5000/api/home
```

---

## 🐛 TROUBLESHOOTING

### Problem: Database connection failed

**Solution:**
1. Check MySQL is running:
   - Windows: Open Services, look for MySQL
   - Mac: `brew services list`
   - Linux: `sudo systemctl status mysql`

2. Verify credentials in `.env` file
3. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

### Problem: Tables not created

**Solution:**
```bash
cd ecommerce-backend
node init-db.js
```

### Problem: Frontend shows "Failed to fetch"

**Solution:**
1. Make sure backend is running (http://localhost:5000)
2. Check `.env.local` has correct API URL
3. Check browser console for errors (F12)

### Problem: Port already in use

**Solution:**
- Backend (5000): Change PORT in `.env`
- Frontend (3000): Run `npm run dev -- -p 3001`

### Problem: Images not loading

**Solution:**
- Images use Unsplash URLs - requires internet connection
- Check next.config.js has proper image domains

---

## 📝 DATABASE STRUCTURE

### Tables Created:

1. **categories**
   - id, name, slug, image, parent_id
   
2. **products**
   - id, name, slug, description, price, sale_price, category_id, image, stock_quantity, is_featured

### Dummy Data Included:

- **5 Categories**: Seating, Tables, Storage, Dining Chairs, Dining Tables
- **8 Products**: Chairs, Tables, Sofas, Bookshelves, etc.

---

## 🚀 NEXT STEPS

### Add More Features:

1. **Cart Functionality**
   - Create cart table in MySQL
   - Add cart API endpoints
   - Implement add to cart in frontend

2. **User Authentication**
   - Create users table
   - Add login/register pages
   - Implement JWT authentication

3. **Product Details Page**
   - Create `/products/[slug]` page
   - Show full product information
   - Add reviews and ratings

4. **Checkout Process**
   - Create orders table
   - Build checkout page
   - Integrate payment gateway

---

## 📚 PROJECT FILES OVERVIEW

### Backend Files:
- `package.json` - Dependencies
- `.env` - Database configuration
- `db.js` - MySQL connection
- `server.js` - Express API routes
- `init-db.js` - Database setup script

### Frontend Files:
- `package.json` - Dependencies
- `.env.local` - API configuration
- `src/app/layout.tsx` - Main layout with navigation
- `src/app/page.tsx` - Home page
- `src/app/products/page.tsx` - Products listing
- `src/app/categories/page.tsx` - Categories listing
- `src/app/about/page.tsx` - About page
- `src/app/profile/page.tsx` - Profile page

---

## ✅ CHECKLIST

**Backend:**
- [ ] MySQL installed and running
- [ ] Database `ecommerce_db` created
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Database initialized (`node init-db.js`)
- [ ] Server running on port 5000

**Frontend:**
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured
- [ ] Server running on port 3000
- [ ] All pages working (Home, Products, Categories, About, Profile)

**Testing:**
- [ ] Backend API responding
- [ ] Frontend loading products
- [ ] Navigation working
- [ ] Images displaying
- [ ] No console errors

---

## 🆘 NEED HELP?

If you encounter issues:

1. Check both servers are running
2. Check MySQL is running
3. Check browser console (F12) for errors
4. Verify `.env` files are correct
5. Try restarting both servers

---

## 🎉 SUCCESS!

If everything is working, you should see:
- ✅ Backend API responding on port 5000
- ✅ Frontend website on port 3000
- ✅ Products and categories loading
- ✅ All navigation links working
- ✅ No 404 errors
- ✅ No blank pages

**Congratulations! Your ecommerce website is now running! 🎊**
