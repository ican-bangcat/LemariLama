import { supabase } from '../lib/supabase';

/**
 * Mengambil semua produk dari database beserta nama kategorinya.
 * @returns {Promise<Array>} Array berisi objek produk.
 */
// READ all products (dengan join ke tabel categories)
export const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)') // Mengambil nama kategori dari tabel relasi
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

// CREATE a new product
export const addProduct = async (productData) => {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select('*, categories(name)') // Mengembalikan data lengkap setelah insert
        .single();
    
    if (error) throw new Error(error.message);
    return data;
};

// UPDATE an existing product
export const updateProduct = async (productId, updatedData) => {
    const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', productId)
        .select('*, categories(name)') // Mengembalikan data lengkap setelah update
        .single();

    if (error) throw new Error(error.message);
    return data;
};


// DELETE a product
export const deleteProduct = async (productId) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (error) throw new Error(error.message);
    return true; // Sukses
};

// READ all categories (untuk dropdown di form)
export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*');

    if (error) throw new Error(error.message);
    return data;
}