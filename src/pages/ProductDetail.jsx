import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Plus,
  Minus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Loader2,
} from "lucide-react";

// Import services dan context
import { getProductById } from "../pages/services/CustomerProduct";
import { getProductMainImage } from "../utils/imageUtils";
import { useCart } from "../pages/contexts/CartContext";
import { useAuth } from "../pages/contexts/AuthContext";
import { useWishlist } from "../pages/contexts/WishListContext";
// Tambah setelah line 20 (setelah import useWishlist)
import {
  getProductReviews,
  getReviewStats,
} from "../pages/services/reviewService";
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist(); // 👈 TAMBAH INI
  // States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  //const [isFavorited, setIsFavorited] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  // Tambah setelah const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingReviews, setLoadingReviews] = useState(false);
  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const productData = await getProductById(id);
        setProduct(productData);

        // Set default size if available
        if (productData?.size) {
          setSelectedSize(productData.size);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);
  // Load reviews when product changes
  useEffect(() => {
    if (product?.id) {
      loadReviews();
    }
  }, [product?.id]);
  const isFavorited = product ? isInWishlist(product.id) : false;
  const handleFavoriteClick = async (e) => {
    e?.stopPropagation?.();

    if (!user) {
      navigate("/login", {
        state: {
          from: window.location.pathname,
          message: "Please login to add items to your wishlist",
        },
      });
      return;
    }

    if (!product) return;

    setAddingToWishlist(true);
    try {
      const response = await toggleWishlist(product.id);

      // Optional: Show success message atau toast
      if (response?.success) {
        console.log(response.message);
        // Bisa tambahkan toast notification:
        // toast.success(response.message);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert(error.message || "Failed to update wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };
  // Helper functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleQuantityChange = (action) => {
    if (action === "increase" && quantity < (product?.stock || 1)) {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect ke login jika belum login
      navigate("/login", {
        state: {
          from: location.pathname,
          message: "Please login to add items to your cart",
        },
      });
      return;
    }

    if (!product || product.is_sold || product.stock <= 0) {
      alert("This product is not available");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(
        product.id,
        quantity,
        selectedSize || product.size,
        null // notes bisa ditambah jika diperlukan
      );

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

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (user) {
      navigate("/cart");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this amazing product: ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };
  // Load reviews dan stats
  const loadReviews = async () => {
    if (!product?.id) return;

    setLoadingReviews(true);
    try {
      // Load reviews
      const reviewsResponse = await getProductReviews(product.id, 1, 5); // First 5 reviews
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data);
      }

      // Load review stats
      const statsResponse = await getReviewStats(product.id);
      if (statsResponse.success) {
        setReviewStats(statsResponse.stats);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };
  // Mock related products (Anda bisa mengganti dengan data real)
  const relatedProducts = [
    {
      id: 1,
      name: "Similar Product 1",
      price: 299000,
      image: "https://placehold.co/200x200",
    },
    {
      id: 2,
      name: "Similar Product 2",
      price: 399000,
      image: "https://placehold.co/200x200",
    },
    {
      id: 3,
      name: "Similar Product 3",
      price: 259000,
      image: "https://placehold.co/200x200",
    },
    {
      id: 4,
      name: "Similar Product 4",
      price: 449000,
      image: "https://placehold.co/200x200",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "The product you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = product.images || [];
  const mainImage = getProductMainImage(productImages);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb & Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="text-sm text-gray-500">
              <span>Products</span>
              <span className="mx-2">/</span>
              <span>{product.categories?.name || "Uncategorized"}</span>
              <span className="mx-2">/</span>
              <span className="text-black">{product.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={productImages[selectedImage] || mainImage}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                onClick={() => setShowImageModal(true)}
              />

              {/* Zoom Icon */}
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-5 h-5" />
              </div>

              {/* Navigation Arrows for Images */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev > 0 ? prev - 1 : productImages.length - 1
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev < productImages.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {product.condition === "new" && (
                  <span className="bg-emerald-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                    NEW
                  </span>
                )}
                {product.is_sold && (
                  <span className="bg-red-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                    SOLD OUT
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex space-x-2">
                  <button
                    onClick={handleFavoriteClick}
                    disabled={addingToWishlist}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      isFavorited ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isFavorited
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      } ${addingToWishlist ? "animate-pulse" : ""}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Share2 className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                {product.categories?.name || "Uncategorized"}
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(reviewStats.averageRating)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({reviewStats.averageRating.toFixed(1)})
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600">
                  {reviewStats.totalReviews}{" "}
                  {reviewStats.totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {/* Mock discount price */}
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.price * 1.2)}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 text-sm font-medium rounded">
                  20% OFF
                </span>
              </div>
            </div>

            {/* Stock & Size */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <span
                  className={`flex items-center ${
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      product.stock > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </span>
                {product.size && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">Size: {product.size}</span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    disabled={quantity >= (product.stock || 1)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    product.is_sold || product.stock <= 0 || addingToCart
                  }
                  className="flex items-center justify-center space-x-2 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium relative"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : addToCartSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={
                    product.is_sold || product.stock <= 0 || addingToCart
                  }
                  className="border border-black text-black py-3 px-6 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Buy Now
                </button>
              </div>

              {/* Login prompt untuk user yang belum login */}
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Please login</strong> to add items to your cart and
                    make purchases.
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span>1 Year Warranty</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5" />
                  <span>30 Days Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description ||
                    "No description available for this product."}
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Features
                    </h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Premium quality materials</li>
                      <li>• Durable construction</li>
                      <li>• Modern design</li>
                      <li>• Easy to use</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What's Included
                    </h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Product unit</li>
                      <li>• User manual</li>
                      <li>• Warranty card</li>
                      <li>• Original packaging</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Product Details
                  </h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category</dt>
                      <dd className="font-medium">
                        {product.categories?.name || "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Size</dt>
                      <dd className="font-medium">{product.size || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Condition</dt>
                      <dd className="font-medium capitalize">
                        {product.condition || "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Stock</dt>
                      <dd className="font-medium">{product.stock || 0}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            
{activeTab === "reviews" && (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h4 className="font-semibold text-gray-900">
        Customer Reviews ({reviewStats.totalReviews})
      </h4>
      <button 
        onClick={() => navigate(`#reviews`)}
        className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Write a Review</span>
      </button>
    </div>

    {/* Review Stats */}
    {reviewStats.totalReviews > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {reviewStats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center text-yellow-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-6 h-6 ${i < Math.floor(reviewStats.averageRating) ? 'fill-current' : ''}`} 
              />
            ))}
          </div>
          <p className="text-gray-600">
            Based on {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 w-8">{rating}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: reviewStats.totalReviews > 0 
                      ? `${(reviewStats.ratingDistribution[rating] / reviewStats.totalReviews) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">
                {reviewStats.ratingDistribution[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Reviews List */}
    {loadingReviews ? (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    ) : reviews.length > 0 ? (
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <div key={review.id || index} className="border-b border-gray-200 pb-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">
                  {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <p className="font-medium text-gray-900">
                    {review.user_name || 'Anonymous User'}
                  </p>
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {review.is_verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{review.review_text}</p>
                
                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex space-x-2 mb-3">
                    {review.images.slice(0, 4).map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={image}
                        alt={`Review image ${imgIndex + 1}`}
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          // Optional: Open image in modal
                          window.open(image, '_blank');
                        }}
                      />
                    ))}
                    {review.images.length > 4 && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600">
                        +{review.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* View All Reviews Button */}
        {reviewStats.totalReviews > reviews.length && (
          <div className="text-center pt-6">
            <button 
              onClick={() => navigate(`/product/${product.id}/reviews`)}
              className="text-black hover:text-gray-700 font-medium transition-colors"
            >
              View All {reviewStats.totalReviews} Reviews →
            </button>
          </div>
        )}
      </div>
    ) : (
      <div className="text-center py-8">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 mb-4">
          Be the first to review this product and help other customers!
        </p>
        <button 
          onClick={() => navigate(`#reviews`)}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Write First Review
        </button>
      </div>
    )}
  </div>
)}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {relatedProduct.name}
                </h4>
                <p className="font-bold text-gray-900">
                  {formatPrice(relatedProduct.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={productImages[selectedImage] || mainImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
