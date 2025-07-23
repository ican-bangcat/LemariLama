// hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { getAllProducts, getAllCategories } from '../pages/services/CustomerProduct';

// Global cache untuk menyimpan data products
let productsCache = {
  products: [],
  categories: [],
  lastFetch: null,
  isLoading: false
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export const useProducts = () => {
  const [products, setProducts] = useState(productsCache.products);
  const [categories, setCategories] = useState(productsCache.categories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const isCacheValid = productsCache.lastFetch && 
                        (now - productsCache.lastFetch) < CACHE_DURATION;

    // Jika cache masih valid dan tidak force refresh, gunakan cache
    if (isCacheValid && !forceRefresh && productsCache.products.length > 0) {
      setProducts(productsCache.products);
      setCategories(productsCache.categories);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (productsCache.isLoading) {
      return;
    }

    productsCache.isLoading = true;
    setLoading(true);
    setError(null);

    // Set timeout untuk mencegah loading stuck
    const timeoutId = setTimeout(() => {
      console.warn('Products loading timeout, forcing complete');
      setLoading(false);
      productsCache.isLoading = false;
    }, 10000);

    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);

      clearTimeout(timeoutId);

      const newProducts = productsData || [];
      const newCategories = categoriesData || [];

      // Update cache
      productsCache = {
        products: newProducts,
        categories: newCategories,
        lastFetch: now,
        isLoading: false
      };

      setProducts(newProducts);
      setCategories(newCategories);
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err.message);
      productsCache.isLoading = false;
    } finally {
      setLoading(false);
      productsCache.isLoading = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    products,
    categories,
    loading,
    error,
    refreshData
  };
};