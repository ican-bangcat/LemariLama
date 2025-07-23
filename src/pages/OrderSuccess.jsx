import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/contexts/AuthContext';
import { orderService } from '../pages/services/orderService';
import { CheckCircle, Package, Clock, CreditCard, MapPin, ArrowRight, Loader2, AlertCircle, Home, ShoppingBag } from 'lucide-react';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('=== ORDER SUCCESS PAGE LOADED ===');
    console.log('Order ID from params:', orderId);
    console.log('User:', user);

    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login', { 
        state: { 
          from: `/order-success/${orderId}`,
          message: 'Please login to view your order' 
        }
      });
      return;
    }

    if (!orderId) {
      console.log('No order ID, redirecting to orders');
      navigate('/orders');
      return;
    }

    fetchOrder();
  }, [orderId, user, navigate]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching order:', orderId, 'for user:', user.id);
      const { data, error } = await orderService.getOrderById(orderId, user.id);
      
      console.log('Order fetch result:', { data, error });
      
      if (error) {
        console.error('Error fetching order:', error);
        setError(error);
      } else if (!data) {
        console.error('No order data returned');
        setError('Pesanan tidak ditemukan');
      } else {
        console.log('Order loaded successfully:', data);
        setOrder(data);
      }
    } catch (err) {
      console.error('Exception while fetching order:', err);
      setError('Gagal memuat detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Tanggal tidak valid';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Menunggu Konfirmasi',
      confirmed: 'Dikonfirmasi',
      processing: 'Diproses',
      shipped: 'Dikirim',
      delivered: 'Diterima',
      cancelled: 'Dibatalkan'
    };
    return texts[status] || status;
  };

  const getPaymentText = (method) => {
    const methods = {
      bank_transfer: 'Transfer Bank',
      e_wallet: 'E-Wallet',
      cod: 'Bayar di Tempat (COD)'
    };
    return methods[method] || method;
  };

  const getPaymentStatusText = (status) => {
    const statuses = {
      pending: 'Menunggu Pembayaran',
      paid: 'Sudah Dibayar',
      failed: 'Gagal',
      refunded: 'Dikembalikan'
    };
    return statuses[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProductImage = (orderItem) => {
    // Coba ambil gambar dari relasi products dulu
    if (orderItem.products?.images && orderItem.products.images.length > 0) {
      const images = orderItem.products.images;
      return Array.isArray(images) ? images[0] : images;
    }
    
    // Fallback ke placeholder
    return 'https://placehold.co/64x64/E2E8F0/4A5568?text=No+Image';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 text-lg">Memuat detail pesanan...</p>
          <div className="mt-4 w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => fetchOrder()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Lihat Semua Pesanan
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">
            Pesanan yang Anda cari tidak ditemukan atau Anda tidak memiliki akses untuk melihatnya.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lihat Semua Pesanan
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Berhasil Dibuat!</h1>
          <p className="text-gray-600 text-lg">
            Terima kasih atas pesanan Anda. Kami akan segera memproses pesanan Anda.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Detail Pesanan</h2>
                <p className="text-gray-600 text-lg font-medium">
                  Nomor Pesanan: <span className="text-gray-900">{order.order_number}</span>
                </p>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <div className="space-y-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                Produk yang Dipesan ({order.order_items?.length || 0} item)
              </h3>
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item, index) => (
                  <div key={item.id || index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={getProductImage(item)}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/64x64/E2E8F0/4A5568?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                        {item.size && <span className="bg-white px-2 py-1 rounded">Size: {item.size}</span>}
                        <span>Qty: {item.quantity}</span>
                        <span>@ {formatPrice(item.product_price)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Tidak ada item dalam pesanan</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pembayaran</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice((order.total_amount || 0) - (order.shipping_cost || 0))}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="text-gray-900">
                    {order.shipping_cost === 0 ? (
                      <span className="text-green-600 font-medium">GRATIS</span>
                    ) : (
                      formatPrice(order.shipping_cost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Alamat Pengiriman</h3>
            </div>
            {order.shipping_address ? (
              <div className="text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">{order.shipping_address.recipient_name}</p>
                <p className="text-sm">{order.shipping_address.phone}</p>
                <p className="text-sm">{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p className="text-sm">{order.shipping_address.address_line2}</p>
                )}
                <p className="text-sm">
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p className="text-sm">{order.shipping_address.country}</p>
              </div>
            ) : (
              <p className="text-gray-500">Alamat tidak tersedia</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pembayaran</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{getPaymentText(order.payment_method)}</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border mt-2 ${getPaymentStatusColor(order.payment_status)}`}>
                  {getPaymentStatusText(order.payment_status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Catatan Pesanan</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{order.notes}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Langkah Selanjutnya
          </h3>
          <div className="space-y-3 text-blue-800">
            {order.payment_method === 'bank_transfer' && order.payment_status === 'pending' && (
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-blue-700 text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Lakukan pembayaran</p>
                  <p className="text-sm text-blue-700">Instruksi pembayaran akan dikirimkan via email dalam 5-10 menit</p>
                </div>
              </div>
            )}
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <Package className="w-3 h-3 text-blue-700" />
              </div>
              <div>
                <p className="font-medium">Pesanan akan diproses</p>
                <p className="text-sm text-blue-700">Setelah pembayaran dikonfirmasi, pesanan akan segera diproses</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <ArrowRight className="w-3 h-3 text-blue-700" />
              </div>
              <div>
                <p className="font-medium">Notifikasi update status</p>
                <p className="text-sm text-blue-700">Anda akan menerima email dan notifikasi untuk setiap update status pesanan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Package className="w-5 h-5 mr-2" />
            Lihat Semua Pesanan
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-semibold"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Lanjut Belanja
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center px-8 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold"
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </button>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Ada pertanyaan tentang pesanan Anda?{' '}
            <button className="text-blue-600 hover:text-blue-800 underline font-medium">
              Hubungi Customer Service
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;