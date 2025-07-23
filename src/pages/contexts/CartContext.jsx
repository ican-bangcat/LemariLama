// contexts/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Load cart items ketika user login
  useEffect(() => {
    if (user) {
      loadCartItems();
      loadCartCount();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [user]);

  const loadCartItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await CartService.getCartItems(user.id);
      if (result.success) {
        setCartItems(result.data);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const addToCart = async (productId, quantity = 1, size = null, notes = null) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }

    try {
      const result = await CartService.addToCart(user.id, productId, quantity, size, notes);
      if (result.success) {
        await loadCartItems();
        await loadCartCount();
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
        await loadCartItems();
        await loadCartCount();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      const result = await CartService.removeFromCart(cartId);
      if (result.success) {
        await loadCartItems();
        await loadCartCount();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
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

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: loadCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};