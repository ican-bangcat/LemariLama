import { supabase } from '../lib/supabase';

/**
 * Mengambil semua produk dari database beserta nama kategorinya.
 * @returns {Promise<Array>} Array berisi objek produk.
 */
export async function getProducts() {
  try {
    // Query ini lebih efisien: mengambil semua kolom dari 'products'
    // dan kolom 'name' dari tabel 'categories' yang berelasi.
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return data;
  } catch (e) {
    console.error("Critical error in getProducts:", e);
    return [];
  }
}

/**
 * Menambahkan produk baru ke database.
 * @param {object} productData - Data produk yang akan ditambahkan.
 * @returns {Promise<object>} Data produk yang berhasil ditambahkan.
 */
export async function addProduct(productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Error adding product:", error);
      throw error;
    }
    
    return data;
  } catch (e) {
    console.error("Critical error in addProduct:", e);
    return null;
  }
}

/**
 * Menghapus produk dari database berdasarkan ID.
 * @param {string} productId - ID produk yang akan dihapus.
 * @returns {Promise<boolean>} True jika berhasil, false jika gagal.
 */
export async function deleteProduct(productId) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
        return true;
    } catch (e) {
        console.error("Critical error in deleteProduct:", e);
        return false;
    }
}


// Anda bisa menambahkan fungsi updateProduct di sini nanti

