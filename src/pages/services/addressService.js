import { supabase } from '../lib/supabase';

export const addressService = {
  // Mendapatkan semua alamat user
  async getUserAddresses(userId) {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      return { data: null, error: error.message };
    }
  },

  // Menambah alamat baru
  async addAddress(userId, addressData) {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert([{
          user_id: userId,
          ...addressData
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding address:', error);
      return { data: null, error: error.message };
    }
  },

  // Update alamat
  async updateAddress(addressId, addressData) {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .update(addressData)
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating address:', error);
      return { data: null, error: error.message };
    }
  },

  // Hapus alamat
  async deleteAddress(addressId) {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting address:', error);
      return { error: error.message };
    }
  },

  // Set alamat sebagai default
  async setDefaultAddress(userId, addressId) {
    try {
      // Pertama, hapus status default dari semua alamat user
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Kemudian set alamat yang dipilih sebagai default
      const { data, error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error setting default address:', error);
      return { data: null, error: error.message };
    }
  }
};