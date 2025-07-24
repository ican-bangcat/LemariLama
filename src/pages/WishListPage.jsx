import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Star,
  Grid,
  List,
  Loader2,
  Check,
  X
} from 'lucide-react';

import { useWishlist } from '../pages/contexts/WishlistContext';
import { useCart } from '../pages/contexts/CartContext';

import { useAuth } from '../pages/contexts/AuthContext';
import { getProductMainImage } from '../utils/imageUtils';

const WishlistItem = ({ item, viewMode, onRemove, onMoveToCart, onView }) => {
  const [removing, setRemoving] = useState(false);
  const [movingToCart, setMovingToCart] = useState(false);
  const [moveSuccess, setMoveSuccess] = useState(false);
  
  const product = item.products;
  const mainImage = getProductMainImage(product.images);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price || 0);
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(product.id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemoving(false);
    }
  };

  const handleMoveToCart = async () => {
    setMovingToCart(true);
    try {
      await onMoveToCart(product.id, 1, product.size);
      setMoveSuccess(true);
      
      // Reset success state setelah 2 detik
      setTimeout(() => {
        setMoveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error moving to cart:', error);
      alert(error.message || 'Failed to move to cart');
    } finally {
      setMovingToCart(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="flex p-6">
          <div className="w-32 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => onView(product.id)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/400x500/E2E8F0/4A5568?text=Error';
              }}
            />
            {product.condition === 'new' && (
              <span className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 text-xs font-medium rounded-full">NEW</span>
            )}
            {product.is_sold && (
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full">SOLD</span>
            )}
            {product.stock <= 0 && !product.is_sold && (
              <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded-full">OUT OF STOCK</span>
            )}
          </div>
          
          <div className="flex-1 ml-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onView(product.id)}>
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{product.categories?.name || 'Uncategorized'}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                <span>Stock: {product.stock || 0}</span>
                {product.size && <span>Size: {product.size}</span>}
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-1 mb-3">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-gray-500">(4.8)</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xl text-gray-900">{formatPrice(product.price)}</span>
                <p className="text-xs text-gray-500 mt-1">Added {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onView(product.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="View product"
                >
                  <Eye className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                </button>
                <button 
                  onClick={handleMoveToCart}
                  disabled={product.is_sold || product.stock <= 0 || movingToCart}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move to cart"
                >
                  {movingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Moving...</span>
                    </>
                  ) : moveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Moved!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Move to Cart</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={handleRemove}
                  disabled={removing}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Remove from wishlist"
                >
                  {removing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
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
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => onView(product.id)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x500/E2E8F0/4A5568?text=Error';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.condition === 'new' && (
            <span className="bg-emerald-500 text-white px-2 py-1 text-xs font-medium rounded-full shadow-lg">NEW</span>
          )}
          {product.is_sold && (
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded-full shadow-lg">SOLD</span>
          )}
          {product.stock <= 0 && !product.is_sold && (
            <span className="bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded-full shadow-lg">OUT OF STOCK</span>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleRemove}
            disabled={removing}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 text-red-500 hover:text-red-700 disabled:opacity-50"
            title="Remove from wishlist"
          >
            {removing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Move to cart button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleMoveToCart}
            disabled={product.is_sold || product.stock <= 0 || movingToCart}
            className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {movingToCart ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Moving...</span>
              </>
            ) : moveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Moved!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Move to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer mb-1" onClick={() => onView(product.id)}>
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{product.categories?.name || 'Uncategorized'}</p>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <span className="text-xs text-gray-500">(4.8)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">{formatPrice(product.price)}</span>
          <div className="text-xs text-gray-400">
            {product.size && `Size: ${product.size}`}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">Added {new Date(item.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, wishlistCount, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart(); // Tambahkan ini
  const [viewMode, setViewMode] = useState('grid');
  const [clearing, setClearing] = useState(false);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing item:', error);
      alert(error.message || 'Failed to remove item from wishlist');
    }
  };

  const handleMoveToCart = async (productId, quantity, size) => {
    try {
      // Tambah ke cart dulu
      await addToCart(productId, quantity, size);
      
      // Lalu hapus dari wishlist
      await removeFromWishlist(productId);
      
      // Sukses!
      return { success: true };
    } catch (error) {
      console.error('Error moving to cart:', error);
      throw error;
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleClearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    setClearing(true);
    try {
      await clearWishlist();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert(error.message || 'Failed to clear wishlist');
    } finally {
      setClearing(false);
    }
  };

  // Redirect jika user belum login
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to view your wishlist and save your favorite products.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlistCount > 0 
                  ? `${wishlistCount} item${wishlistCount > 1 ? 's' : ''} saved for later`
                  : 'No items in your wishlist yet'
                }
              </p>
            </div>
            
            {wishlistCount > 0 && (
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleClearWishlist}
                  disabled={clearing}
                  className="text-red-600 hover:text-red-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {clearing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Clear All</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {wishlistCount > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {wishlist.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                viewMode={viewMode}
                onRemove={handleRemoveItem}
                onMoveToCart={handleMoveToCart}
                onView={handleViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">
                Start adding products you love to your wishlist. You can find the heart icon on any product.
              </p>
              <button 
                onClick={() => navigate('/products')}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;