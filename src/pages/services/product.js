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
/**
 * Mengambil produk terbaru untuk homepage.
 * @param {number} limit - Jumlah produk yang ingin diambil (default 4)
 */
export const getNewProducts = async (limit = 4) => {
    console.log(`Fetching ${limit} new products for homepage`);
    
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(name),
            product_images(
                id,
                image_url,
                is_primary,
                display_order
            )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
        
    if (error) {
        console.error("Error fetching new products:", error);
        throw new Error(error.message);
    }
    
    // Format data untuk homepage - pastikan ada images array
    const formattedData = data?.map(product => ({
        ...product,
        // Buat images array dari product_images
        images: product.product_images
            ?.sort((a, b) => a.display_order - b.display_order)
            ?.map(img => ({ url: img.image_url, id: img.id })) || [],
        // Hitung discount jika ada original_price
        discount: product.original_price 
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
            : null
    })) || [];
    
    console.log("New products fetched successfully:", formattedData);
    return formattedData;
};

/**
 * Mengambil produk berdasarkan ID untuk detail page.
 */
export const getProductById = async (productId) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories(name),
            product_images(
                id,
                image_url,
                is_primary,
                display_order
            )
        `)
        .eq('id', productId)
        .single();
        
    if (error) {
        console.error("Error fetching product by ID:", error);
        throw new Error(error.message);
    }
    
    // Format images array
    const formattedProduct = {
        ...data,
        images: data.product_images
            ?.sort((a, b) => a.display_order - b.display_order)
            ?.map(img => ({ url: img.image_url, id: img.id })) || []
    };
    
    return formattedProduct;
};