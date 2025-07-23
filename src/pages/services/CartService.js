// services/CartService.js
import { supabase } from '../lib/supabase'; // Sesuaikan path dengan konfigurasi Supabase Anda

export const CartService = {
  // Menambah item ke keranjang
  async addToCart(userId, productId, quantity = 1, size = null, notes = null) {
    try {
      // Cek apakah item sudah ada di keranjang dengan size yang sama
      const { data: existingItem, error: checkError } = await supabase
        .from('carts')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .eq('size', size)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingItem) {
        // Update quantity jika item sudah ada
        const { data, error } = await supabase
          .from('carts')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select();

        if (error) throw error;
        return { success: true, data, message: 'Item quantity updated in cart' };
      } else {
        // Tambah item baru ke keranjang
        const { data, error } = await supabase
          .from('carts')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity: quantity,
            size: size,
            notes: notes
          })
          .select();

        if (error) throw error;
        return { success: true, data, message: 'Item added to cart' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  },

  // Mengambil semua item di keranjang user
  async getCartItems(userId) {
    try {
      const { data, error } = await supabase
        .from('carts')
        .select(`
          *,
          products (
            id,
            name,
            price,
            stock,
            condition,
            is_sold,
            images,
            categories (
              name
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Update quantity item di keranjang
  async updateCartItemQuantity(cartId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(cartId);
      }

      const { data, error } = await supabase
        .from('carts')
        .update({ 
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return { success: false, error: error.message };
    }
  },

  // Menghapus item dari keranjang
  async removeFromCart(cartId) {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartId);

      if (error) throw error;
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  },

  // Menghapus semua item dari keranjang user
  async clearCart(userId) {
    try {
      const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, message: 'Cart cleared' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  },

  // Menghitung total item di keranjang
  async getCartCount(userId) {
    try {
      const { count, error } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting cart count:', error);
      return { success: false, count: 0, error: error.message };
    }
  }
};