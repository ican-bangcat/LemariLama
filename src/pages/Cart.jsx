import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, Tag, Gift, Loader2, ShoppingBag, Star, Heart, Package } from 'lucide-react';
import { useCart } from '../pages/contexts/CartContext';
import { useAuth } from '../pages/contexts/AuthContext';
import { getProductMainImage } from '../utils/imageUtils';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, loading, updateQuantity, removeFromCart, clearCart, proceedToCheckout  } = useCart();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
const handleCheckout = () => {
  if (selectedItems.length === 0) {
    alert('Pilih minimal satu item untuk di-checkout');
    return;
  }

  // Siapkan data cart items yang dipilih dengan format yang benar
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  
  // Format data untuk checkout
  const checkoutData = selectedCartItems.map(item => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.products?.name || 'Unknown Product',
    price: item.products?.price || 0,
    quantity: item.quantity,
    size: item.size,
    image: getProductMainImage(item.products?.images || []),
    subtotal: (item.products?.price || 0) * item.quantity
  }));

  // Navigate ke checkout dengan data
  navigate('/checkout', { 
    state: { 
      cartItems: checkoutData,
      selectedItemIds: selectedItems,
      subtotal,
      discount,
      deliveryFee,
      total
    }
  });
};

  // Redirect jika user belum login
  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/cart',
          message: 'Please login to view your shopping cart' 
        }
      });
    }
  }, [user, navigate]);

  // Initialize selected items ketika cart items berubah
  useEffect(() => {
    if (cartItems.length > 0) {
      // Select semua item yang available (tidak sold out dan ada stock)
      const availableItems = cartItems
        .filter(item => !item.products?.is_sold && (item.products?.stock || 0) > 0)
        .map(item => item.id);
      setSelectedItems(availableItems);
    } else if (cartItems.length === 0 && !loading) {
      // Reset selected items jika cart kosong dan tidak loading
      setSelectedItems([]);
    }
  }, [cartItems, loading]);

  // Handle tab visibility change - fix infinite loading
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset loading state jika tab menjadi visible kembali
        // Tapi hanya jika sudah ada data cart atau user tidak login
        if (cartItems.length > 0 || !user) {
          // Loading sudah selesai, tidak perlu reset
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cartItems.length, user]);

  const handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set([...prev, cartId]));
    try {
      await updateQuantity(cartId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartId) => {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    try {
      await removeFromCart(cartId);
      // Remove from selected items jika ada
      setSelectedItems(prev => prev.filter(id => id !== cartId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const toggleItemSelection = (cartId) => {
    setSelectedItems(prev => {
      if (prev.includes(cartId)) {
        return prev.filter(id => id !== cartId);
      } else {
        return [...prev, cartId];
      }
    });
  };

  const selectAllItems = () => {
    const availableItems = cartItems
      .filter(item => !item.products?.is_sold && (item.products?.stock || 0) > 0)
      .map(item => item.id);
    
    const allSelected = availableItems.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItems);
    }
  };

  const applyPromoCode = () => {
    const code = promoCode.toLowerCase().trim();
    if (code === 'save20') {
      setAppliedPromo({ code: 'SAVE20', discount: 0.2 });
    } else if (code === 'welcome10') {
      setAppliedPromo({ code: 'WELCOME10', discount: 0.1 });
    } else if (code === 'new15') {
      setAppliedPromo({ code: 'NEW15', discount: 0.15 });
    } else {
      alert('Invalid promo code');
      return;
    }
    setPromoCode('');
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      await clearCart();
      setSelectedItems([]);
      setAppliedPromo(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  // Calculations
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => {
    return sum + ((item.products?.price || 0) * item.quantity);
  }, 0);
  const discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const deliveryFee = subtotal > 500000 ? 0 : 25000;
  const total = subtotal - discount + deliveryFee;
  const allAvailableSelected = cartItems
    .filter(item => !item.products?.is_sold && (item.products?.stock || 0) > 0)
    .every(item => selectedItems.includes(item.id));
  const selectedCount = selectedItems.length;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user) {
    return null; // Akan redirect ke login
  }

  // Improved loading condition - pastikan loading tidak stuck
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-700 text-lg">Loading your amazing cart...</p>
          <div className="mt-4 w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-black rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center hover:text-black transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Shopping
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-black font-semibold">Shopping Cart</span>
          </div>

          {/* Empty Cart */}
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <ShoppingBag className="w-16 h-16 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-8 w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">0</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                Ready to discover amazing products? <br />
                Start your shopping journey and fill up your cart with premium items!
              </p>
              <button 
                onClick={() => navigate('/products')}
                className="bg-black text-white px-10 py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-10">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center hover:text-black transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Shopping
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-black font-semibold">Shopping Cart</span>
          </div>

          {/* Cart Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-700 bg-clip-text text-transparent mb-4">
              YOUR CART
            </h1>
            <p className="text-gray-600 text-lg">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for checkout
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Cart Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  Clear All
                </button>
              </div>
              
              {/* Select All */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={allAvailableSelected}
                    onChange={selectAllItems}
                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0"
                  />
                  <span className="text-lg font-semibold text-gray-900">
                    Select All ({cartItems.filter(item => !item.products?.is_sold && (item.products?.stock || 0) > 0).length} available)
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedCount} of {cartItems.length} selected
                </div>
              </div>
            </div>
            
            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = item.products;
                const mainImage = getProductMainImage(product?.images || []);
                const isUnavailable = product?.is_sold || (product?.stock || 0) <= 0;
                const isUpdating = updatingItems.has(item.id);
                const isSelected = selectedItems.includes(item.id);
                
                return (
                  <div 
                    key={item.id} 
                    className={`bg-white border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${
                      isSelected ? 'border-black shadow-md' : 'border-gray-100 hover:border-gray-200'
                    } ${isUnavailable ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={isUnavailable}
                        className="w-6 h-6 text-black border-gray-300 rounded focus:ring-black focus:ring-offset-0 mt-2 disabled:opacity-50"
                      />

                      {/* Product Image */}
                      <div className="w-28 h-28 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">
                        <img
                          src={mainImage}
                          alt={product?.name || 'Product'}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/112x112/E2E8F0/4A5568?text=No+Image';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-black transition-colors">
                              {product?.name || 'Unknown Product'}
                            </h3>
                            <p className="text-gray-500 mb-2 font-medium">
                              {product?.categories?.name || 'Uncategorized'}
                            </p>
                            
                            {/* Product Meta */}
                            <div className="flex items-center space-x-6 mb-3">
                              {item.size && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="font-medium">Size:</span>
                                  <span className="ml-1 bg-gray-100 px-2 py-1 rounded-md">{item.size}</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-600">
                                <Package className="w-4 h-4 mr-1" />
                                <span>Stock: {product?.stock || 0}</span>
                              </div>
                            </div>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-1 mb-3">
                              <div className="flex items-center text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 ml-2">(4.8)</span>
                            </div>
                            
                            {/* Status badges */}
                            <div className="flex items-center space-x-2">
                              {product?.is_sold && (
                                <span className="bg-red-100 border border-red-200 text-red-800 px-3 py-1 text-xs font-bold rounded-full">
                                  SOLD OUT
                                </span>
                              )}
                              {(product?.stock || 0) <= 0 && !product?.is_sold && (
                                <span className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1 text-xs font-bold rounded-full">
                                  OUT OF STOCK
                                </span>
                              )}
                              {product?.condition === 'new' && (
                                <span className="bg-green-100 border border-green-200 text-green-800 px-3 py-1 text-xs font-bold rounded-full">
                                  NEW
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl font-bold text-black">
                              {formatPrice(product?.price || 0)}
                            </span>
                            <span className="text-sm text-gray-500">per item</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-600 mr-2">Qty:</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUnavailable || isUpdating}
                              className="w-10 h-10 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:border-black hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            
                            <div className="flex items-center justify-center w-12 h-10 bg-gray-50 rounded-xl border-2 border-gray-100">
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              ) : (
                                <span className="font-bold text-lg">{item.quantity}</span>
                              )}
                            </div>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (product?.stock || 1) || isUnavailable || isUpdating}
                              className="w-10 h-10 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:border-black hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                <Tag className="w-6 h-6 mr-3" />
                Promo Code
              </h3>
              
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-black text-white rounded-xl p-6">
                  <div className="flex items-center">
                    <Gift className="w-6 h-6 mr-3" />
                    <div>
                      <span className="font-bold text-lg">
                        {appliedPromo.code} Applied!
                      </span>
                      <p className="text-gray-300 text-sm">
                        You saved {(appliedPromo.discount * 100)}% on your order
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removePromo}
                    className="text-white hover:text-gray-300 text-sm underline font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code (try: SAVE20, WELCOME10, NEW15)"
                    className="flex-grow px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all duration-200 text-lg"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={!promoCode.trim()}
                    className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    Apply
                  </button>
                </div>
              )}
              
              {/* Promo suggestions */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">Available Promo Codes:</p>
                <div className="flex flex-wrap gap-2">
                  {['SAVE20', 'WELCOME10', 'NEW15'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setPromoCode(code)}
                      className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-lg hover:border-black transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-4">
              <h3 className="text-2xl font-bold mb-8 text-gray-900">Order Summary</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-lg">
                    Subtotal ({selectedCount} {selectedCount === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between items-center text-green-600 bg-green-50 p-4 rounded-xl">
                    <div>
                      <span className="font-semibold">Discount ({appliedPromo.code})</span>
                      <p className="text-sm text-green-500">-{(appliedPromo.discount * 100)}% off</p>
                    </div>
                    <span className="font-bold text-lg">-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600 text-lg">Shipping Fee</span>
                    {deliveryFee === 0 && subtotal > 0 && (
                      <p className="text-sm text-green-600">Free shipping over Rp 500k!</p>
                    )}
                  </div>
                  <span className="font-bold text-lg">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-2xl font-bold text-black bg-gray-50 p-4 rounded-xl">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* <button 
                disabled={selectedCount === 0}
                className="w-full bg-black text-white py-5 rounded-xl mt-8 hover:bg-gray-800 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Checkout ({selectedCount})
              </button> */}
              <button 
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full bg-black text-white py-5 rounded-xl mt-8 hover:bg-gray-800 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Checkout ({selectedItems.length})
              </button>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/products')}
                  className="text-gray-600 hover:text-black text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
              <h4 className="font-bold mb-6 text-gray-900 text-lg">We Accept</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'VISA', color: 'bg-blue-600' },
                  { name: 'MC', color: 'bg-red-600' },
                  { name: 'DANA', color: 'bg-blue-500' },
                  { name: 'OVO', color: 'bg-purple-600' }
                ].map((payment) => (
                  <div key={payment.name} className={`${payment.color} text-white rounded-lg p-3 text-center font-bold text-sm shadow-sm`}>
                    {payment.name}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Secure payment protected by SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;