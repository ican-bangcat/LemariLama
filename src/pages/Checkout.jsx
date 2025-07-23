import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../pages/contexts/AuthContext';
import { useCart } from '../pages/contexts/CartContext';
import { orderService } from '../pages/services/orderService';
import { addressService } from '../pages/services/addressService';
import { ShoppingBag, MapPin, CreditCard, FileText, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data dari navigation state
  const checkoutData = location.state;
  const cartItems = checkoutData?.cartItems || [];
  const cartTotal = checkoutData?.subtotal || 0;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = checkoutData?.deliveryFee || 15000;
  const discount = checkoutData?.discount || 0;
  const totalAmount = checkoutData?.total || (cartTotal + shippingCost - discount);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Cek apakah ada data checkout
    if (!checkoutData || cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [user, checkoutData, cartItems, navigate]);

  const fetchAddresses = async () => {
    const { data, error } = await addressService.getUserAddresses(user.id);
    if (error) {
      setError('Gagal mengambil alamat');
    } else {
      setAddresses(data || []);
      // Auto select default address
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Pilih alamat pengiriman');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        cartItems: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          image: item.image
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
        notes: notes.trim() || null
      };

      const { data: order, error } = await orderService.createOrder(user.id, orderData);
      
      if (error) {
        setError(error);
        return;
      }

      // Clear cart setelah berhasil
      clearCart();
      
      // Redirect ke halaman success
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      setError('Terjadi kesalahan saat membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Transfer Bank', description: 'BCA, Mandiri, BNI, BRI' },
    { value: 'e_wallet', label: 'E-Wallet', description: 'GoPay, OVO, DANA' },
    { value: 'cod', label: 'Bayar di Tempat (COD)', description: 'Bayar saat barang diterima' }
  ];

  // Jika tidak ada data checkout, redirect
  if (!checkoutData || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Data Checkout</h2>
          <p className="text-gray-600 mb-4">Silakan kembali ke keranjang untuk melanjutkan</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kembali ke Keranjang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Keranjang
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">
            {cartItems.length} item siap untuk dibeli
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Belum ada alamat tersimpan</p>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Tambah Alamat
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          checked={selectedAddress?.id === address.id}
                          onChange={() => setSelectedAddress(address)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="font-medium">{address.label}</span>
                            {address.is_default && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900 font-medium">{address.recipient_name}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => navigate('/addresses')}
                    className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:text-gray-700"
                  >
                    + Tambah Alamat Baru
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod(method.value)}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <p className="font-medium">{method.label}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold">Catatan (Opsional)</h2>
              </div>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan untuk pesanan Anda..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center mb-4">
                <ShoppingBag className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold">Ringkasan Pesanan</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item, index) => (
                  <div key={`${item.product_id}-${item.size}-${index}`} className="flex items-center space-x-3">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.product_name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/48x48/E2E8F0/4A5568?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product_name}
                      </p>
                      {item.size && (
                        <p className="text-xs text-gray-500">Size: {item.size}</p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cartItems.length} item)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Ongkos Kirim</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Memproses...' : 'Buat Pesanan'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Dengan melakukan pemesanan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;