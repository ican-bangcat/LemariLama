import { supabase } from '../lib/supabase';
//CustomerProduct.js
/**
 * CUSTOMER VIEW - PRODUCT SERVICES
 * Fungsi-fungsi untuk tampilan customer (tidak termasuk CRUD admin)
 */

/**
 * Mengambil semua produk yang tersedia untuk customer
 * Filter: hanya produk yang stoknya > 0 dan tidak di-mark sebagai sold
 */
export const getAvailableProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .gt('stock', 0)  // Hanya produk dengan stok > 0
        .eq('is_sold', false)  // Hanya produk yang belum terjual
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error getting available products:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Mengambil semua produk (termasuk yang sold out) - untuk halaman "All Products"
 */
export const getAllProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error getting all products:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Mengambil produk berdasarkan ID
 */
export const getProductById = async (productId) => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('id', productId)
        .single();
    
    if (error) {
        console.error("Error getting product by ID:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Search produk berdasarkan nama atau deskripsi
 */
export const searchProducts = async (searchTerm) => {
    if (!searchTerm) return getAvailableProducts();
    
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .gt('stock', 0)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error searching products:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Filter produk berdasarkan kategori
 */
export const getProductsByCategory = async (categoryId) => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('category_id', categoryId)
        .gt('stock', 0)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error getting products by category:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Filter produk berdasarkan range harga
 */
export const getProductsByPriceRange = async (minPrice, maxPrice) => {
    let query = supabase
        .from('products')
        .select('*, categories(id, name)')
        .gt('stock', 0)
        .eq('is_sold', false);
    
    if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
    }
    
    if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error getting products by price range:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Mendapatkan produk terbaru (NEW items)
 */
export const getNewProducts = async (limit = 8) => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .eq('condition', 'new')
        .gt('stock', 0)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error("Error getting new products:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Mendapatkan produk yang sedang sale/diskon
 */
export const getSaleProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .not('original_price', 'is', null)  // Produk yang punya original_price (sale)
        .gt('stock', 0)
        .eq('is_sold', false)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error getting sale products:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Mendapatkan produk dengan stok rendah (untuk urgency marketing)
 */
export const getLowStockProducts = async (threshold = 5) => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name)')
        .lte('stock', threshold)
        .gt('stock', 0)
        .eq('is_sold', false)
        .order('stock', { ascending: true });
    
    if (error) {
        console.error("Error getting low stock products:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Mengambil semua kategori yang memiliki produk tersedia
 */
export const getAvailableCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select(`
            *,
            products!inner(id)
        `)
        .gt('products.stock', 0)
        .eq('products.is_sold', false);
    
    if (error) {
        console.error("Error getting available categories:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Mengambil semua kategori (untuk filter)
 */
export const getAllCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
        
    if (error) {
        console.error("Error getting categories:", error);
        throw new Error(error.message);
    }
    
    return data;
};

/**
 * Advanced filter dengan multiple parameter
 */
export const filterProducts = async (filters = {}) => {
    let query = supabase
        .from('products')
        .select('*, categories(id, name)');
    
    // Filter availability (default: hanya yang available)
    if (filters.showAll !== true) {
        query = query.gt('stock', 0).eq('is_sold', false);
    }
    
    // Filter by category
    if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
    }
    
    // Filter by price range
    if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
    }
    
    // Filter by condition
    if (filters.condition) {
        query = query.eq('condition', filters.condition);
    }
    
    // Filter by size
    if (filters.size) {
        query = query.eq('size', filters.size);
    }
    
    // Search term
    if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }
    
    // Sorting
    if (filters.sortBy) {
        switch (filters.sortBy) {
            case 'price-low':
                query = query.order('price', { ascending: true });
                break;
            case 'price-high':
                query = query.order('price', { ascending: false });
                break;
            case 'name':
                query = query.order('name', { ascending: true });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'stock':
                query = query.order('stock', { ascending: false });
                break;
            default:
                query = query.order('created_at', { ascending: false });
        }
    } else {
        query = query.order('created_at', { ascending: false });
    }
    
    // Limit
    if (filters.limit) {
        query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error("Error filtering products:", error);
        throw new Error(error.message);
    }
    
    return data;
};