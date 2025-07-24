import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Loader2,
  Check,
} from "lucide-react";

// Import fungsi dari service Anda
import {
  getAllProducts,
  getAllCategories,
} from "../pages/services/CustomerProduct";
// Import image utility yang sudah kita perbaiki
import { getProductMainImage } from "../utils/imageUtils";
// Import context
import { useCart } from "../pages/contexts/CartContext";
import { useAuth } from "../pages/contexts/AuthContext";
import { useWishlist } from "../pages/contexts/WishlistContext";
// Simple cache untuk prevent re-loading
const dataCache = {
  products: [],
  categories: [],
  timestamp: null,
  isValid: () => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 menit
    return (
      dataCache.timestamp && Date.now() - dataCache.timestamp < CACHE_DURATION
    );
  },
};

// --- Komponen ProductCard yang dipercantik ---
const ProductCard = ({ product, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  //const [isFavorited, setIsFavorited] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist(); // 👈 TAMBAH INI
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const mainImage = getProductMainImage(product.images);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };
  const isFavorited = isInWishlist(product.id);
  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Please login to add items to your wishlist",
        },
      });
      return;
    }

    setAddingToWishlist(true);
    try {
      const response = await toggleWishlist(product.id);

      // Optional: Show success message
      if (response?.success) {
        console.log(response.message);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(error.message || "Failed to update wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/product/${product.id}`);
  };

  const handleQuickAdd = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Please login to add items to your cart",
        },
      });
      return;
    }

    if (product.is_sold || product.stock <= 0) {
      alert("This product is not available");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, 1, product.size);
      setAddToCartSuccess(true);

      // Reset success state setelah 2 detik
      setTimeout(() => {
        setAddToCartSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.message || "Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (viewMode === "list") {
    return (
      <div
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex p-4">
          <div className="w-32 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/400x500/E2E8F0/4A5568?text=Error";
              }}
            />
            {product.condition === "new" && (
              <span className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                NEW
              </span>
            )}
            {product.is_sold && (
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                SOLD
              </span>
            )}
            {product.stock <= 0 && !product.is_sold && (
              <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                OUT OF STOCK
              </span>
            )}
          </div>

          <div className="flex-1 ml-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {product.categories?.name || "Uncategorized"}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Stock: {product.stock || 0}</span>
                <span>Size: {product.size || "N/A"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-sm text-gray-500 ml-1">(4.8)</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFavoriteClick}
                  disabled={addingToWishlist}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorited
                        ? "text-red-500 fill-current"
                        : "text-gray-400 hover:text-red-500"
                    } ${addingToWishlist ? "animate-pulse" : ""}`}
                  />
                </button>
                <button
                  onClick={handleQuickView}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Eye className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                </button>
                <button
                  onClick={handleQuickAdd}
                  disabled={
                    product.is_sold || product.stock <= 0 || addingToCart
                  }
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : addToCartSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/5] mb-4 shadow-sm hover:shadow-lg transition-all duration-300">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/400x500/E2E8F0/4A5568?text=Error";
          }}
        />

        {/* Gradient overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.condition === "new" && (
            <span className="bg-emerald-500 text-white px-3 py-1 text-xs font-medium rounded-full shadow-lg">
              NEW
            </span>
          )}
          {product.is_sold && (
            <span className="bg-red-500 text-white px-3 py-1 text-xs font-medium rounded-full shadow-lg">
              SOLD
            </span>
          )}
          {product.stock <= 0 && !product.is_sold && (
            <span className="bg-orange-500 text-white px-3 py-1 text-xs font-medium rounded-full shadow-lg">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div
          className={`absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <button
            onClick={handleFavoriteClick}
            disabled={addingToWishlist}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? "text-red-500 fill-current" : "text-gray-600"
              } ${addingToWishlist ? "animate-pulse" : ""}`}
            />
          </button>

          <button
            onClick={handleQuickView}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Quick add to cart */}
        <div
          className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={handleQuickAdd}
            disabled={product.is_sold || product.stock <= 0 || addingToCart}
            className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingToCart ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : addToCartSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500">
          {product.categories?.name || "Uncategorized"}
        </p>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <span className="text-xs text-gray-500">(4.8)</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">
            {formatPrice(product.price)}
          </span>
          <div className="text-xs text-gray-400">
            Stock: {product.stock || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Utama Products yang dipercantik ---
const Products = () => {
  const [products, setProducts] = useState(dataCache.products);
  const [categories, setCategories] = useState(dataCache.categories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const loadData = async () => {
      // Jika cache valid dan ada data, gunakan cache
      if (dataCache.isValid() && dataCache.products.length > 0) {
        setProducts(dataCache.products);
        setCategories(dataCache.categories);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const timeoutId = setTimeout(() => {
        console.warn("Products loading timeout, forcing complete");
        setLoading(false);
      }, 8000);

      try {
        const [productsData, categoriesData] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);

        clearTimeout(timeoutId);

        const newProducts = productsData || [];
        const newCategories = categoriesData || [];

        // Update cache
        dataCache.products = newProducts;
        dataCache.categories = newCategories;
        dataCache.timestamp = Date.now();

        setProducts(newProducts);
        setCategories(newCategories);
      } catch (error) {
        clearTimeout(timeoutId);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reset loading state saat component mount (navigation)
  useEffect(() => {
    // Jika ada data di cache, langsung set loading false
    if (dataCache.products.length > 0) {
      setLoading(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        product.categories?.name === selectedCategory;

      let matchesPrice = true;
      if (priceRange === "Under 100k") matchesPrice = product.price < 100000;
      else if (priceRange === "100k - 300k")
        matchesPrice = product.price >= 100000 && product.price <= 300000;
      else if (priceRange === "300k - 500k")
        matchesPrice = product.price >= 300000 && product.price <= 500000;
      else if (priceRange === "Over 500k")
        matchesPrice = product.price > 500000;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "popular":
          return Math.random() - 0.5; // Mock popularity
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });
    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const categoryOptions = ["All", ...categories.map((cat) => cat.name)];
  const priceOptions = [
    "All",
    "Under 100k",
    "100k - 300k",
    "300k - 500k",
    "Over 500k",
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setPriceRange("All");
    setSortBy("newest");
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600 mb-4">Oops! Something went wrong</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-700 bg-clip-text text-transparent mb-4">
            ALL PRODUCTS
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our curated collection of premium products, handpicked just
            for you
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Sidebar Filters */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-8">
                {/* Category Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">Category</h4>
                  <div className="space-y-3">
                    {categoryOptions.map((category) => (
                      <label
                        key={category}
                        className="flex items-center group cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-black transition-colors">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">
                    Price Range
                  </h4>
                  <div className="space-y-3">
                    {priceOptions.map((range) => (
                      <label
                        key={range}
                        className="flex items-center group cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="price"
                          value={range}
                          checked={priceRange === range}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-black transition-colors">
                          {range}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">
                        {products.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total Products
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-black">
                        {categories.length}
                      </div>
                      <div className="text-xs text-gray-500">Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Enhanced Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                <div className="relative flex-1 sm:w-96">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for amazing products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white shadow-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-xl p-6 shadow-lg mb-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Category</h4>
                    <div className="space-y-2">
                      {categoryOptions.map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="radio"
                            name="mobile-category"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={(e) =>
                              setSelectedCategory(e.target.value)
                            }
                            className="mr-3"
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="space-y-2">
                      {priceOptions.map((range) => (
                        <label key={range} className="flex items-center">
                          <input
                            type="radio"
                            name="mobile-price"
                            value={range}
                            checked={priceRange === range}
                            onChange={(e) => setPriceRange(e.target.value)}
                            className="mr-3"
                          />
                          <span className="text-sm">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-black">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-black">
                  {products.length}
                </span>{" "}
                products
              </p>

              {(searchTerm ||
                selectedCategory !== "All" ||
                priceRange !== "All") && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    We couldn't find any products matching your filters. Try
                    adjusting your search criteria.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
