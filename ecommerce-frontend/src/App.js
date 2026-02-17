import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast, Toast } from './components/Toast';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import VendorRegister from './pages/VendorRegister';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const AppContent = () => {
  const { toast, hideToast } = useToast();

  return (
    <>
      <Header />
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/vendor-register" element={<VendorRegister />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
