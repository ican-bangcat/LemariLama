import { supabase } from '../lib/supabase'; // Sesuaikan path

// Submit review baru
export const submitReview = async (reviewData) => {
  try {
    const { userId, productId, orderId, rating, reviewText, images } = reviewData;

    console.log('=== SUBMIT REVIEW ===');
    console.log('Review data:', reviewData);

    if (!userId || !productId || !rating) {
      throw new Error('User ID, Product ID, and Rating are required');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Cek apakah user sudah pernah review produk ini untuk order ini
    const { data: existingReview, error: checkError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('order_id', orderId)
      .single();

    if (existingReview) {
      throw new Error('You have already reviewed this product for this order');
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check error:', checkError);
      throw checkError;
    }

    // Cek apakah user eligible untuk review - SIMPLIFIED QUERY
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'delivered')
      .single();

    if (orderError || !order) {
      console.error('Order check error:', orderError);
      throw new Error('You can only review products from delivered orders');
    }

    // Cek apakah produk ada di order tersebut
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .select('id')
      .eq('order_id', orderId)
      .eq('product_id', productId)
      .single();

    if (itemError || !orderItem) {
      console.error('Order item check error:', itemError);
      throw new Error('Product not found in this order');
    }

    // Insert review - SIMPLIFIED WITHOUT JOIN
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          order_id: orderId,
          rating: parseInt(rating),
          review_text: reviewText,
          images: images || [],
          is_verified: true // Karena dari delivered order
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    console.log('Review inserted successfully:', data);

    return {
      success: true,
      message: 'Review submitted successfully',
      data
    };

  } catch (error) {
    console.error('Error submitting review:', error);
    throw new Error(error.message || 'Failed to submit review');
  }
};

// Upload review images
export const uploadReviewImages = async (files, userId, reviewId = null) => {
  try {
    if (!files || files.length === 0) {
      return { success: true, urls: [] };
    }

    const uploadedUrls = [];

    for (const file of files) {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPG, PNG, and GIF images are allowed');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size must be less than 5MB');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${timestamp}_${randomString}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('review-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('review-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return {
      success: true,
      urls: uploadedUrls
    };

  } catch (error) {
    console.error('Error uploading review images:', error);
    throw new Error(error.message || 'Failed to upload images');
  }
};

// Get reviews untuk produk tertentu
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // SIMPLIFIED: Just get reviews without user profile join
    const { data, error, count } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw new Error(error.message || 'Failed to fetch reviews');
  }
};

// Get review statistics untuk produk
export const getReviewStats = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: true,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
          }
        }
      };
    }

    const totalReviews = data.length;
    const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    return {
      success: true,
      stats: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution
      }
    };

  } catch (error) {
    console.error('Error fetching review stats:', error);
    throw new Error(error.message || 'Failed to fetch review statistics');
  }
};

// Get user's reviews
export const getUserReviews = async (userId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    // SIMPLIFIED: Get reviews first, then fetch product data separately if needed
    const { data, error, count } = await supabase
      .from('product_reviews')
      .select(`
        *,
        products!inner (
          id,
          name,
          images
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw new Error(error.message || 'Failed to fetch user reviews');
  }
};

// Update review
export const updateReview = async (reviewId, userId, updateData) => {
  try {
    const { rating, reviewText, images } = updateData;

    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (rating) updates.rating = parseInt(rating);
    if (reviewText !== undefined) updates.review_text = reviewText;
    if (images !== undefined) updates.images = images;

    const { data, error } = await supabase
      .from('product_reviews')
      .update(updates)
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Review updated successfully',
      data
    };

  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error(error.message || 'Failed to update review');
  }
};
// Delete review
export const deleteReview = async (reviewId, userId) => {
  try {
    // Get review data first to delete images
    const { data: review, error: getError } = await supabase
      .from('product_reviews')
      .select('images')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();

    if (getError) throw getError;

    // Delete images from storage
    if (review.images && review.images.length > 0) {
      for (const imageUrl of review.images) {
        try {
          // Extract filename from URL
          const urlParts = imageUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          await supabase.storage
            .from('review-images')
            .remove([`${userId}/${fileName}`]);
        } catch (imgError) {
          console.warn('Failed to delete image:', imgError);
          // Continue with review deletion even if image deletion fails
        }
      }
    }

    // Delete review
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'Review deleted successfully'
    };

  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error(error.message || 'Failed to delete review');
  }
};

// Check if user can review product
export const canUserReviewProduct = async (userId, productId, orderId = null) => {
  try {
    let query = supabase
      .from('orders')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'delivered');

    if (orderId) {
      query = query.eq('id', orderId);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return {
        success: true,
        canReview: false,
        hasDeliveredOrder: false,
        hasExistingReview: false
      };
    }

    // Check for existing review
    const { data: existingReview, error: reviewError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (reviewError) throw reviewError;

    return {
      success: true,
      canReview: !existingReview || existingReview.length === 0,
      hasDeliveredOrder: true,
      hasExistingReview: existingReview && existingReview.length > 0
    };

  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get review by ID - SIMPLIFIED
export const getReviewById = async (reviewId) => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Error fetching review:', error);
    throw new Error(error.message || 'Failed to fetch review');
  }
};