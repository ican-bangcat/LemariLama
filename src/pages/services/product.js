import { supabase } from '../lib/supabase';

/**
 * Meng-upload satu file gambar ke Supabase Storage.
 */
export async function uploadImage(file) {
  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Mengambil semua produk dengan nama kategorinya.
 */
export const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

/**
 * Menambah produk baru.
 * Menerima data produk yang sudah lengkap dengan admin_id.
 */
export const addProduct = async (productData) => {
    console.log("Adding product with data:", productData);
    
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select('*, categories(name)')
        .single();
        
    if (error) {
        console.error("Error adding product:", error);
        throw new Error(error.message);
    }
    
    console.log("Product added successfully:", data);
    return data;
};

/**
 * Mengupdate produk yang sudah ada.
 */
export const updateProduct = async (productId, updatedData) => {
    console.log("Updating product:", productId, "with data:", updatedData);
    
    const { data, error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', productId)
        .select('*, categories(name)')
        .single();
        
    if (error) {
        console.error("Error updating product:", error);
        throw new Error(error.message);
    }
    
    console.log("Product updated successfully:", data);
    return data;
};

/**
 * Menghapus produk.
 */
export const deleteProduct = async (productId) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
        
    if (error) {
        console.error("Error deleting product:", error);
        throw new Error(error.message);
    }
    
    return true;
};

/**
 * Mengambil semua kategori.
 */
export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*');
        
    if (error) {
        console.error("Error getting categories:", error);
        throw new Error(error.message);
    }
    
    return data;
}