import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { userId, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadWishlist = async () => {
    if (!isAuthenticated || !userId) {
      setWishlistItems([]);
      setWishlistCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/wishlist/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setWishlistItems(data.data || []);
        setWishlistCount((data.data || []).length);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAuthenticated]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add to wishlist');
    }

    const isInWishlist = wishlistItems.some(item => item.product_id === productId);

    try {
      if (isInWishlist) {
        const wishlistItem = wishlistItems.find(item => item.product_id === productId);
        if (wishlistItem) {
          const response = await fetch(`${API_URL}/api/wishlist/${wishlistItem.id}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          
          if (data.success) {
            await loadWishlist();
            return { success: true, added: false };
          }
        }
      } else {
        const response = await fetch(`${API_URL}/api/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId),
            product_id: productId
          })
        });

        const data = await response.json();
        
        if (data.success) {
          await loadWishlist();
          return { success: true, added: true };
        }
      }
      return { success: false };
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return { success: false };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    toggleWishlist,
    isInWishlist,
    loadWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
