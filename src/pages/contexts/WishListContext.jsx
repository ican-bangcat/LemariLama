import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getWishlistByUser, 
  addToWishlist, 
  removeFromWishlist, 
  checkIfInWishlist,
  getWishlistCount,
  toggleWishlist,
  clearWishlist
} from '../services/wishListService';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set()); // Track product IDs

  // Load wishlist saat user login
  useEffect(() => {
    if (user?.id) {
      loadWishlist();
    } else {
      // Clear wishlist saat user logout
      setWishlist([]);
      setWishlistCount(0);
      setWishlistItems(new Set());
    }
  }, [user]);

  // Load wishlist dari database
  const loadWishlist = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await getWishlistByUser(user.id);
      if (response.success) {
        setWishlist(response.data);
        setWishlistCount(response.data.length);
        
        // Update wishlistItems Set untuk quick lookup
        const productIds = new Set(response.data.map(item => item.products.id));
        setWishlistItems(productIds);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tambah ke wishlist
  const addToWishlistHandler = async (productId) => {
    if (!user?.id) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      const response = await addToWishlist(user.id, productId);
      if (response.success) {
        // Update local state
        setWishlistItems(prev => new Set([...prev, productId]));
        setWishlistCount(prev => prev + 1);
        
        // Reload wishlist untuk data terbaru
        await loadWishlist();
        
        return {
          success: true,
          message: 'Product added to wishlist'
        };
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw new Error(error.message || 'Failed to add to wishlist');
    }
  };

  // Hapus dari wishlist
  const removeFromWishlistHandler = async (productId) => {
    if (!user?.id) return;

    try {
      const response = await removeFromWishlist(user.id, productId);
      if (response.success) {
        // Update local state
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setWishlistCount(prev => Math.max(0, prev - 1));
        
        // Update wishlist array
        setWishlist(prev => prev.filter(item => item.products.id !== productId));
        
        return {
          success: true,
          message: 'Product removed from wishlist'
        };
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw new Error(error.message || 'Failed to remove from wishlist');
    }
  };

  // Toggle wishlist (add/remove)
  const toggleWishlistHandler = async (productId) => {
    if (!user?.id) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      const response = await toggleWishlist(user.id, productId);
      
      if (response.success) {
        if (response.action === 'added') {
          setWishlistItems(prev => new Set([...prev, productId]));
          setWishlistCount(prev => prev + 1);
        } else {
          setWishlistItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          setWishlistCount(prev => Math.max(0, prev - 1));
          setWishlist(prev => prev.filter(item => item.products.id !== productId));
        }
        
        return {
          success: true,
          action: response.action,
          message: response.message
        };
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw new Error(error.message || 'Failed to update wishlist');
    }
  };

  // Cek apakah produk ada di wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.has(productId);
  };

  // Clear semua wishlist
  const clearWishlistHandler = async () => {
    if (!user?.id) return;

    try {
      const response = await clearWishlist(user.id);
      if (response.success) {
        setWishlist([]);
        setWishlistCount(0);
        setWishlistItems(new Set());
        
        return {
          success: true,
          message: 'Wishlist cleared'
        };
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw new Error(error.message || 'Failed to clear wishlist');
    }
  };

  // Pindah ke cart
  const moveToCart = async (productId, quantity = 1, size = null) => {
    if (!user?.id) {
      throw new Error('Please login to add items to cart');
    }

    try {
      // Gunakan addToCart dari service langsung tanpa dynamic import
      // Hapus dari wishlist dulu
      await removeFromWishlistHandler(productId);
      
      // Lalu tambah ke cart menggunakan service yang sudah ada
      // Kita akan handle ini di komponen yang memanggil moveToCart
      return {
        success: true,
        message: 'Product removed from wishlist. Please add to cart manually.'
      };
      
    } catch (error) {
      console.error('Error moving to cart:', error);
      throw new Error(error.message || 'Failed to move to cart');
    }
  };

  const contextValue = {
    wishlist,
    wishlistCount,
    loading,
    
    // Actions
    addToWishlist: addToWishlistHandler,
    removeFromWishlist: removeFromWishlistHandler,
    toggleWishlist: toggleWishlistHandler,
    clearWishlist: clearWishlistHandler,
    moveToCart,
    loadWishlist,
    
    // Utilities
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};