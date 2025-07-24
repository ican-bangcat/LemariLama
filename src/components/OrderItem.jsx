// src/components/OrderItem.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye } from 'lucide-react';
import { getProductMainImage } from '../utils/imageUtils';

const OrderItem = ({ item, onReview, onViewReview, hasReview }) => {
  const navigate = useNavigate();
  const product = item.products || {};
  const mainImage = getProductMainImage(product.images);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(price || 0);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={mainImage}
          alt={product.name || item.product_name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => navigate(`/product/${item.product_id}`)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x500/E2E8F0/4A5568?text=Error';
          }}
        />
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer" 
            onClick={() => navigate(`/product/${item.product_id}`)}>
          {product.name || item.product_name}
        </h4>
        <div className="text-sm text-gray-500 mt-1">
          <span>Qty: {item.quantity}</span>
          {item.size && <span className="ml-4">Size: {item.size}</span>}
        </div>
        <p className="font-semibold text-gray-900 mt-1">
          {formatPrice(item.product_price * item.quantity)}
        </p>
      </div>
      
      <div className="flex flex-col space-y-2">
        {hasReview ? (
          <button
            onClick={() => onViewReview(item.product_id)}
            className="flex items-center space-x-2 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Lihat Review</span>
          </button>
        ) : (
          <button
            onClick={() => onReview(item)}
            className="flex items-center space-x-2 text-sm bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <Star className="w-4 h-4" />
            <span>Tulis Review</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderItem;