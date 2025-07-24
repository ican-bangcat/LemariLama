// src/components/ReviewModal.jsx
import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Upload, 
  ImageIcon, 
  Trash2, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Camera
} from 'lucide-react';

import { submitReview, uploadReviewImages } from '../pages/services/reviewService';
import { useAuth } from '../pages/contexts/AuthContext';
import { getProductMainImage } from '../utils/imageUtils';

const StarRating = ({ rating, onRatingChange, interactive = true, size = 'default' }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoveredRating(star)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
          className={`transition-colors ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${!interactive ? 'pointer-events-none' : ''}`}
        >
          <Star 
            className={`${sizeClasses[size]} ${
              star <= (hoveredRating || rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } transition-all duration-200`}
          />
        </button>
      ))}
    </div>
  );
};

const ImagePreview = ({ file, onRemove, uploading = false }) => {
  const [imageUrl, setImageUrl] = useState(null);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div className="relative group">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Review" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
        )}
      </div>
      
      {!uploading && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

const ReviewModal = ({ item, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    reviewText: '',
    images: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: form, 2: success

  const product = item.products || {};
  const mainImage = getProductMainImage(product.images);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    setError(null);
  };

  const handleTextChange = (e) => {
    setFormData(prev => ({ ...prev, reviewText: e.target.value }));
    setError(null);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        setError('Only JPG, PNG, and GIF images are allowed');
        return false;
      }
      
      if (!isValidSize) {
        setError('Image size must be less than 5MB');
        return false;
      }
      
      return true;
    });

    // Limit to 5 images total
    const currentCount = selectedFiles.length;
    const newFiles = validFiles.slice(0, 5 - currentCount);
    
    if (currentCount + files.length > 5) {
      setError('Maximum 5 images allowed');
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (formData.rating === 0) {
      setError('Please select a rating');
      return false;
    }

    if (formData.reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return false;
    }

    if (formData.reviewText.trim().length > 1000) {
      setError('Review must be less than 1000 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload images first if any
      let imageUrls = [];
      if (selectedFiles.length > 0) {
        setUploading(true);
        const uploadResponse = await uploadReviewImages(selectedFiles, user.id);
        if (uploadResponse.success) {
          imageUrls = uploadResponse.urls;
        }
        setUploading(false);
      }

      // Submit review
      const reviewData = {
        userId: user.id,
        productId: item.product_id,
        orderId: item.order_id,
        rating: formData.rating,
        reviewText: formData.reviewText.trim(),
        images: imageUrls
      };

      const response = await submitReview(reviewData);
      
      if (response.success) {
        setStep(2);
        // Auto close after 2 seconds
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to submit review');
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Very Bad',
      2: 'Bad', 
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };
    return texts[rating] || '';
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for your review. It helps other customers make better decisions.
          </p>
          <button
            onClick={() => onSuccess && onSuccess()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <img
              src={mainImage}
              alt={product.name || item.product_name}
              className="w-16 h-16 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/400x500/E2E8F0/4A5568?text=Error';
              }}
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {product.name || item.product_name}
              </h3>
              <p className="text-sm text-gray-500">
                Order #{item.order_number}
              </p>
              {item.size && (
                <p className="text-sm text-gray-500">Size: {item.size}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-4">
              <StarRating 
                rating={formData.rating} 
                onRatingChange={handleRatingChange}
                size="large"
              />
              {formData.rating > 0 && (
                <span className="text-sm font-medium text-gray-600">
                  {getRatingText(formData.rating)}
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={formData.reviewText}
              onChange={handleTextChange}
              placeholder="Share your experience with this product. What did you like or dislike about it?"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Minimum 10 characters, maximum 1000 characters
              </p>
              <p className="text-xs text-gray-500">
                {formData.reviewText.length}/1000
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional)
            </label>
            
            {/* Selected Images */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {selectedFiles.map((file, index) => (
                  <ImagePreview
                    key={index}
                    file={file}
                    onRemove={() => removeImage(index)}
                    uploading={uploading}
                  />
                ))}
              </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length < 5 && (
              <label className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to add photos ({selectedFiles.length}/5)
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, GIF up to 5MB each
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={submitting || uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be honest and fair in your review</li>
              <li>• Focus on the product quality and your experience</li>
              <li>• Avoid inappropriate language or personal attacks</li>
              <li>• Include specific details that might help other buyers</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || formData.rating === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : uploading ? (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;