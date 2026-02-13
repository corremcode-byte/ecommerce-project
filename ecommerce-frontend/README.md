# Furnii - Premium Furniture E-commerce React Application

A modern, accessible, and interactive React.js e-commerce application for a premium furniture store.

## Features

- 🛍️ **Full E-commerce Functionality**
  - Product browsing and search
  - Shopping cart management
  - Wishlist functionality
  - Order management
  - User authentication

- ♿ **Accessibility Features**
  - ARIA labels and roles
  - Keyboard navigation support
  - Focus management
  - Screen reader friendly

- 🎨 **Modern UI/UX**
  - Responsive design
  - Smooth animations and transitions
  - Toast notifications
  - Loading states
  - Interactive components

- ⚡ **React Best Practices**
  - Context API for state management
  - React Router for navigation
  - Component-based architecture
  - Hooks for state and effects

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:5001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Header.js
│   ├── Navigation.js
│   ├── Footer.js
│   ├── ProductCard.js
│   └── Toast.js
├── contexts/           # Context providers
│   ├── AuthContext.js
│   ├── CartContext.js
│   └── WishlistContext.js
├── pages/              # Page components
│   ├── Home.js
│   ├── Products.js
│   ├── Cart.js
│   ├── Checkout.js
│   ├── Login.js
│   ├── Register.js
│   ├── Profile.js
│   ├── Orders.js
│   └── Wishlist.js
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles
```

## Available Routes

- `/` - Home page
- `/products` - All products (supports `?category=` and `?search=` query params)
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/login` - Login page
- `/register` - Registration page
- `/profile` - User profile
- `/orders` - Order history
- `/wishlist` - Wishlist

## Key Features

### State Management
- **AuthContext**: Manages user authentication state
- **CartContext**: Handles shopping cart operations
- **WishlistContext**: Manages wishlist functionality
- **ToastContext**: Provides toast notifications

### Accessibility
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interactions

## API Integration

The app expects a backend API running on `http://localhost:5001` with the following endpoints:

- `GET /api/products` - Get all products
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
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

## Technologies Used

- React 18.2.0
- React Router DOM 6.20.0
- CSS3 with custom properties
- Fetch API for HTTP requests

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the Furnii e-commerce application.
