// src/components/OrderCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Loader2
} from 'lucide-react';
import OrderItem from './OrderItem';

const OrderCard = ({ order, onConfirmDelivery, onReview, onViewReview, reviewableItems = [] }) => {
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const navigate = useNavigate();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <Package className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Diterima';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price || 0);
  };

  const handleConfirmDelivery = async () => {
    setConfirmingDelivery(true);
    try {
      await onConfirmDelivery(order.id);
    } catch (error) {
      console.error('Error confirming delivery:', error);
    } finally {
      setConfirmingDelivery(false);
    }
  };

  // Cek apakah item sudah di-review
  const checkIfReviewed = (productId) => {
    return reviewableItems.some(item => item.product_id === productId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <div>
              <h3 className="font-semibold text-gray-900">Order #{order.order_number}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatPrice(order.total_amount)}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman:</p>
            <p className="text-sm text-gray-600">
              {order.shipping_address.full_name}<br />
              {order.shipping_address.street}, {order.shipping_address.city}<br />
              {order.shipping_address.province} {order.shipping_address.postal_code}<br />
              {order.shipping_address.phone}
            </p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-6">
        <div className="space-y-3">
          {order.order_items?.map((item) => (
            <OrderItem
              key={item.id}
              item={item}
              onReview={onReview}
              onViewReview={onViewReview}
              hasReview={order.status === 'delivered' && !checkIfReviewed(item.product_id)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Dibuat: {new Date(order.created_at).toLocaleDateString('id-ID')}</span>
            {order.updated_at !== order.created_at && (
              <>
                <span>•</span>
                <span>Diupdate: {new Date(order.updated_at).toLocaleDateString('id-ID')}</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Button untuk status shipped - Konfirmasi Pesanan Diterima */}
            {order.status === 'shipped' && (
              <button
                onClick={handleConfirmDelivery}
                disabled={confirmingDelivery}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirmingDelivery ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Pesanan Diterima</span>
                  </>
                )}
              </button>
            )}

            {/* Info untuk status delivered */}
            {order.status === 'delivered' && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Pesanan Selesai</span>
              </div>
            )}

            {/* Button detail order */}
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              Detail Order →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;