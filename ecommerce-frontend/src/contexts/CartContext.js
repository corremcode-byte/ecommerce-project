import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const API_URL = 'http://localhost:5001';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { userId, isAuthenticated } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    if (!isAuthenticated || !userId) {
      setCartCount(0);
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data.items);
        setCartCount(data.data.items.length);
        setCartTotal(data.data.total);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId, isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          product_id: productId,
          quantity: quantity
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadCart();
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Error adding to cart' };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadCart();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'Error updating quantity' };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadCart();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Error removing from cart' };
    }
  };

  const value = {
    cartCount,
    cartItems,
    cartTotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    loadCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
