// contexts/CartContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CartService } from '../services/CartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Ref untuk tracking request yang sedang berjalan
  const loadingTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Load cart items ketika user login
  useEffect(() => {
    if (user) {
      loadCartItems();
      loadCartCount();
    } else {
      // Reset state ketika user logout
      setCartItems([]);
      setCartCount(0);
      setLoading(false);
      setInitialLoad(false);
    }

    // Cleanup function
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user]);

  // Handle visibility change untuk mencegah stuck loading
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && loading) {
        // Jika halaman menjadi visible dan masih loading, set timeout untuk reset
        loadingTimeoutRef.current = setTimeout(() => {
          if (loading) {
            console.warn('Loading timeout reached, resetting loading state');
            setLoading(false);
            setInitialLoad(false);
          }
        }, 3000); // 3 detik timeout
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading]);

  const loadCartItems = async () => {
    if (!user) return;
    
    // Abort previous request jika ada
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    
    // Set timeout untuk loading
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('Cart loading timeout, forcing complete');
      setLoading(false);
      setInitialLoad(false);
    }, 10000); // 10 detik timeout maksimal

    try {
      const result = await CartService.getCartItems(user.id);
      
      // Clear timeout karena request berhasil
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      if (result.success && !abortControllerRef.current.signal.aborted) {
        setCartItems(result.data);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading cart items:', error);
        // Set empty array jika error
        setCartItems([]);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  };

  const loadCartCount = async () => {
    if (!user) return;
    
    try {
      const result = await CartService.getCartCount(user.id);
      if (result.success) {
        setCartCount(result.count);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  const addToCart = async (productId, quantity = 1, size = null, notes = null) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    try {
      const result = await CartService.addToCart(user.id, productId, quantity, size, notes);
      if (result.success) {
        // Refresh cart data setelah menambah item
        await Promise.all([loadCartItems(), loadCartCount()]);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      const result = await CartService.updateCartItemQuantity(cartId, quantity);
      if (result.success) {
        // Update local state untuk immediate feedback
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === cartId ? { ...item, quantity } : item
          ).filter(item => item.quantity > 0) // Remove item jika quantity 0
        );
        
        // Update cart count
        await loadCartCount();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Reload cart items jika update gagal
      await loadCartItems();
      throw error;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const result = await CartService.removeFromCart(cartId);
      if (result.success) {
        // Update local state untuk immediate feedback
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartId));
        await loadCartCount();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Reload cart items jika remove gagal
      await loadCartItems();
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      const result = await CartService.clearCart(user.id);
      if (result.success) {
        setCartItems([]);
        setCartCount(0);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Helper function untuk force refresh cart
  const refreshCart = async () => {
    if (user) {
      await Promise.all([loadCartItems(), loadCartCount()]);
    }
  };

  const value = {
    cartItems,
    cartCount,
    loading: loading && initialLoad, // Only show loading on initial load
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};