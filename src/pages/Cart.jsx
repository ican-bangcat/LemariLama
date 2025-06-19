import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowLeft, Tag, Gift } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Black Leather Boots',
      category: 'Premium',
      price: 899000,
      originalPrice: 1200000,
      quantity: 1,
      size: '42',
      color: 'Black',
      image: '/api/placeholder/150/150',
      selected: true
    },
    {
      id: 2,
      name: 'Classic White Shirt',
      category: 'Essential',
      price: 299000,
      originalPrice: 399000,
      quantity: 2,
      size: 'L',
      color: 'White',
      image: '/api/placeholder/150/150',
      selected: true
    },
    {
      id: 3,
      name: 'Casual T-Shirt',
      category: 'Basic',
      price: 199000,
      originalPrice: null,
      quantity: 1,
      size: 'M',
      color: 'Navy',
      image: '/api/placeholder/150/150',
      selected: false
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const toggleItemSelection = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAllItems = () => {
    const allSelected = cartItems.every(item => item.selected);
    setCartItems(items =>
      items.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'save20') {
      setAppliedPromo({ code: 'SAVE20', discount: 0.2 });
    } else if (promoCode.toLowerCase() === 'welcome10') {
      setAppliedPromo({ code: 'WELCOME10', discount: 0.1 });
    } else {
      alert('Kode promo tidak valid');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const deliveryFee = subtotal > 500000 ? 0 : 25000;
  const total = subtotal - discount + deliveryFee;
  const allSelected = cartItems.every(item => item.selected);
  const selectedCount = selectedItems.length;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="hover:text-black cursor-pointer">Back to Shopping</span>
          <span>/</span>
          <span className="text-black font-medium">Shopping Cart</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Your Cart ({cartItems.length} items)</h2>
            
            {/* Select All */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={selectAllItems}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-lg font-medium">
                  Pilih Semua ({cartItems.length})
                </span>
              </div>
              <span className="text-green-600 font-medium cursor-pointer hover:underline">
                Hapus
              </span>
            </div>
            
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-2"
                    />

                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                      <div className="w-full h-full bg-black rounded-lg"></div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>Size: {item.size}</span>
                            <span>Color: {item.color}</span>
                          </div>
                        </div>
                        <div 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-black">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <div
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <div
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Promo Code
              </h3>
              
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      {appliedPromo.code} applied! You saved {(appliedPromo.discount * 100)}%
                    </span>
                  </div>
                  <span
                    onClick={removePromo}
                    className="text-green-600 hover:text-green-800 text-sm underline cursor-pointer"
                  >
                    Remove
                  </span>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code (try: SAVE20 or WELCOME10)"
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  <div
                    onClick={applyPromoCode}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer text-center"
                  >
                    Apply
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-6">Ringkasan belanja</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total ({selectedCount} barang)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ongkos Kirim</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? 'GRATIS' : formatPrice(deliveryFee)}
                  </span>
                </div>
                
                {deliveryFee === 0 && subtotal > 0 && (
                  <p className="text-sm text-green-600">🎉 Gratis ongkir untuk pembelian di atas Rp 500.000</p>
                )}
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Harga</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="w-full bg-green-500 text-white py-4 rounded-lg mt-6 hover:bg-green-600 transition-colors font-medium text-center cursor-pointer">
                Beli ({selectedCount})
              </div>

              <div className="mt-4 text-center">
                <span className="text-gray-600 hover:text-black text-sm underline cursor-pointer">
                  Continue Shopping
                </span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
              <h4 className="font-semibold mb-4">We Accept</h4>
              <div className="flex space-x-2">
                <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold">VISA</div>
                <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold">MC</div>
                <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold">DANA</div>
                <div className="w-12 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs font-bold">OVO</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;