import { supabase } from '../lib/supabase';

// Tambahkan produk ke wishlist
export const addToWishlist = async (userId, productId) => {
  try {
    if (!userId || !productId) {
      throw new Error('User ID and Product ID are required');
    }

    // Cek apakah sudah ada di wishlist
    const { data: existing, error: checkError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      throw new Error('Product already in wishlist');
    }

    // Tambahkan ke wishlist
    const { data, error } = await supabase
      .from('wishlists')
      .insert([
        {
          user_id: userId,
          product_id: productId
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Product added to wishlist',
      data
    };

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw new Error(error.message || 'Failed to add product to wishlist');
  }
};

// Hapus produk dari wishlist
export const removeFromWishlist = async (userId, productId) => {
  try {
    if (!userId || !productId) {
      throw new Error('User ID and Product ID are required');
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;

    return {
      success: true,
      message: 'Product removed from wishlist'
    };

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw new Error(error.message || 'Failed to remove product from wishlist');
  }
};

// Ambil semua wishlist user
export const getWishlistByUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        products!inner (
          id,
          name,
          price,
          images,
          size,
          stock,
          condition,
          is_sold,
          categories (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || []
    };

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw new Error(error.message || 'Failed to fetch wishlist');
  }
};

// Cek apakah produk ada di wishlist
export const checkIfInWishlist = async (userId, productId) => {
  try {
    if (!userId || !productId) {
      return false;
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;

  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
};

// Ambil jumlah item di wishlist
export const getWishlistCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    return count || 0;

  } catch (error) {
    console.error('Error getting wishlist count:', error);
    return 0;
  }
};

// Toggle wishlist (add/remove)
export const toggleWishlist = async (userId, productId) => {
  try {
    const isInWishlist = await checkIfInWishlist(userId, productId);
    
    if (isInWishlist) {
      await removeFromWishlist(userId, productId);
      return {
        success: true,
        action: 'removed',
        message: 'Product removed from wishlist'
      };
    } else {
      await addToWishlist(userId, productId);
      return {
        success: true,
        action: 'added',
        message: 'Product added to wishlist'
      };
    }

  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw new Error(error.message || 'Failed to update wishlist');
  }
};

// Fungsi ini dihapus karena menyebabkan circular import
// Sebagai gantinya, kita handle move to cart di level komponen

// Clear semua wishlist
export const clearWishlist = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'Wishlist cleared'
    };

  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw new Error(error.message || 'Failed to clear wishlist');
  }
};