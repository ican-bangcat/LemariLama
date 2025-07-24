// services/orderService.js
import { supabase } from "../lib/supabase";

export const orderService = {
  // Generate nomor order unik
  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  },

  // Buat pesanan baru dari cart
  async createOrder(userId, orderData) {
    console.log("=== ORDER SERVICE CREATE ORDER ===");
    console.log("User ID:", userId);
    console.log("Order data received:", orderData);

    try {
      const { cartItems, shippingAddress, paymentMethod, notes } = orderData;

      console.log("Extracted cart items:", cartItems);
      console.log("Shipping address:", shippingAddress);
      console.log("Payment method:", paymentMethod);

      // Validasi data
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Tidak ada item dalam pesanan");
      }

      if (!shippingAddress) {
        throw new Error("Alamat pengiriman harus dipilih");
      }

      // Hitung total
      const subtotal = cartItems.reduce((total, item) => {
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        return total + itemPrice * itemQuantity;
      }, 0);

      const shippingCost = subtotal > 500000 ? 0 : 15000; // Free shipping over 500k
      const totalAmount = subtotal + shippingCost;

      // Generate nomor order
      const orderNumber = this.generateOrderNumber();

      console.log("Creating order with data:", {
        userId,
        orderNumber,
        subtotal,
        shippingCost,
        totalAmount,
        cartItems: cartItems.length,
        shippingAddress: shippingAddress.recipient_name,
      });

      // Buat order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: userId,
            order_number: orderNumber,
            total_amount: totalAmount,
            shipping_cost: shippingCost,
            discount_amount: 0,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            notes: notes || null,
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created successfully:", order.id);

      // Buat order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.price,
        quantity: item.quantity,
        size: item.size || null,
        subtotal: (item.price || 0) * (item.quantity || 1),
      }));

      console.log("Creating order items:", orderItems.length);

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        // Rollback: hapus order yang sudah dibuat
        await supabase.from("orders").delete().eq("id", order.id);
        throw itemsError;
      }

      console.log("Order items created successfully");

      // Clear cart setelah order berhasil
      const { error: cartError } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", userId);

      if (cartError) {
        console.warn("Failed to clear cart:", cartError.message);
      }

      console.log("Cart cleared successfully");

      return { data: order, error: null };
    } catch (error) {
      console.error("Error in createOrder:", error);
      return {
        data: null,
        error: error.message || "Terjadi kesalahan saat membuat pesanan",
      };
    }
  },

  // Ambil pesanan user
  // Ubah bagian ini di orderService.js
async getUserOrders(userId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          size,
          subtotal,
          products (
            name,
            images
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,  // ← TAMBAHKAN INI
      data: data || [],
      error: null,
      total: count,
      hasMore: count > offset + limit,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { 
      success: false,  // ← TAMBAHKAN INI
      data: [], 
      error: error.message, 
      total: 0, 
      hasMore: false 
    };
  }
},

  // Ambil detail pesanan
  async getOrderById(orderId, userId = null) {
    try {
      console.log("=== FETCHING ORDER BY ID ===");
      console.log("Order ID:", orderId);
      console.log("User ID:", userId);

      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_price,
            quantity,
            size,
            subtotal,
            products (
              id,
              name,
              images,
              price
            )
          )
        `
        )
        .eq("id", orderId);

      // Jika userId diberikan, filter berdasarkan user (untuk customer)
      if (userId) {
        query = query.eq("user_id", userId);
      }

      console.log("Executing query...");
      const { data, error } = await query.single();

      console.log("Query result:", { data, error });

      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      if (!data) {
        console.error("No data returned");
        throw new Error("Pesanan tidak ditemukan");
      }

      console.log("Order fetched successfully:", data);
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching order:", error);
      return { data: null, error: error.message };
    }
  },

  // Update status pesanan (untuk admin)
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating order status:", error);
      return { data: null, error: error.message };
    }
  },

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating payment status:", error);
      return { data: null, error: error.message };
    }
  },

  // Cancel order - FIXED VERSION
 // Fixed cancelOrder function di orderService.js
async cancelOrder(orderId, userId) {
  try {
    console.log("=== CANCEL ORDER ===");
    console.log("Order ID:", orderId);
    console.log("User ID:", userId);

    // Cek apakah order masih bisa dibatalkan dan milik user
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("status, user_id")
      .eq("id", orderId)
      .eq("user_id", userId)
      .single(); // Gunakan .single() untuk mendapatkan satu record

    console.log("Fetch result:", { order, fetchError });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    if (!order) {
      throw new Error("Pesanan tidak ditemukan");
    }

    if (order.status !== "pending") {
      throw new Error("Pesanan tidak dapat dibatalkan karena sudah diproses");
    }

    // Update status order dengan menggunakan .single() untuk mendapatkan data yang diupdate
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", userId)
      .select()
      .single(); // Tambahkan .single() di sini

    console.log("Update result:", { data, error });

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

    if (!data) {
      throw new Error("Gagal membatalkan pesanan - tidak ada data yang diupdate");
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { data: null, error: error.message };
  }
},
  // Ambil semua pesanan (untuk admin)
  async getAllOrders(page = 1, limit = 20, status = null) {
    try {
      console.log("=== FETCHING ALL ORDERS FOR ADMIN ===");
      console.log("Page:", page, "Limit:", limit, "Status:", status);

      const offset = (page - 1) * limit;

      let query = supabase.from("orders_with_profiles").select(
        `
        *,
        order_items (
          id,
          product_name,
          quantity,
          subtotal
        )
      `,
        { count: "exact" }
      );

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Transform data to match expected format
      const transformedData =
        data?.map((order) => ({
          ...order,
          profiles: {
            name: order.customer_name,
            phone: order.customer_phone,
            address: order.customer_address,
          },
        })) || [];

      console.log(
        "Orders fetched:",
        transformedData.length,
        "Total count:",
        count
      );

      return {
        data: transformedData,
        error: null,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return { data: [], error: error.message, total: 0, hasMore: false };
    }
  },

  // Statistik pesanan (untuk admin dashboard)
  async getOrderStats() {
    try {
      // Total orders
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Pending orders
      const { count: pendingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Orders hari ini
      const today = new Date().toISOString().split("T")[0];
      const { count: todayOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lt("created_at", `${today}T23:59:59.999Z`);

      // Total revenue
      const { data: revenueData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "paid");

      const totalRevenue =
        revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      return {
        data: {
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          todayOrders: todayOrders || 0,
          totalRevenue,
        },
        error: null,
      };
    } catch (error) {
      console.error("Error fetching order stats:", error);
      return { data: null, error: error.message };
    }
  },

  // Upload payment proof
  async uploadPaymentProof(orderId, file, userId) {
    try {
      console.log("Uploading payment proof for order:", orderId);

      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${orderId}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Save payment proof record to database
      const { data, error } = await supabase
        .from("payment_proofs")
        .insert({
          order_id: orderId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        // If database insert fails, clean up uploaded file
        await supabase.storage.from("payment-proofs").remove([fileName]);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      return { data: null, error: error.message };
    }
  },

  // Get payment proofs for an order
  async getPaymentProofs(orderId) {
    try {
      const { data, error } = await supabase
        .from("payment_proofs")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching payment proofs:", error);
      return { data: [], error: error.message };
    }
  },

  // Get signed URL for payment proof file
  async getPaymentProofUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;

      return { data: data.signedUrl, error: null };
    } catch (error) {
      console.error("Error getting payment proof URL:", error);
      return { data: null, error: error.message };
    }
  },

  // Update payment proof status (admin only)
  async updatePaymentProofStatus(proofId, status, adminNotes = null) {
    try {
      const { data, error } = await supabase
        .from("payment_proofs")
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proofId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error updating payment proof status:", error);
      return { data: null, error: error.message };
    }
  },
  
};
// Tambahkan fungsi ini ke orderService.js yang sudah ada

// Konfirmasi pesanan diterima oleh customer
export const confirmDelivery = async (orderId, userId) => {
  try {
    if (!orderId || !userId) {
      throw new Error('Order ID and User ID are required');
    }

    // Cek apakah order milik user dan status = shipped
    const { data: order, error: checkError } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'shipped')
      .single();

    if (checkError) {
      throw new Error('Order not found or not eligible for delivery confirmation');
    }

    // Update status ke delivered
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'Order delivery confirmed successfully',
      data
    };

  } catch (error) {
    console.error('Error confirming delivery:', error);
    return {
      success: false,
      error: error.message || 'Failed to confirm delivery'
    };
  }
};

// Cek apakah user bisa review produk dari order tertentu
export const canReviewProduct = async (userId, productId, orderId = null) => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        status,
        order_items!inner (
          product_id
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'delivered')
      .eq('order_items.product_id', productId);

    if (orderId) {
      query = query.eq('id', orderId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Cek apakah sudah pernah review
    const { data: existingReview, error: reviewError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (reviewError) throw reviewError;

    return {
      success: true,
      canReview: data && data.length > 0 && (!existingReview || existingReview.length === 0),
      hasDeliveredOrder: data && data.length > 0,
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

// Get orders yang bisa di-review (delivered tapi belum di-review)
export const getReviewableOrders = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        created_at,
        total_amount,
        status,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          size,
          products (
            id,
            name,
            images
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter items yang belum di-review
    const ordersWithReviewableItems = [];

    for (const order of data || []) {
      const reviewableItems = [];
      
      for (const item of order.order_items || []) {
        // Cek apakah produk ini sudah di-review
        const { data: existingReview } = await supabase
          .from('product_reviews')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', item.product_id)
          .eq('order_id', order.id)
          .single();

        if (!existingReview) {
          reviewableItems.push(item);
        }
      }

      if (reviewableItems.length > 0) {
        ordersWithReviewableItems.push({
          ...order,
          reviewable_items: reviewableItems
        });
      }
    }

    return {
      success: true,
      data: ordersWithReviewableItems
    };

  } catch (error) {
    console.error('Error fetching reviewable orders:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch reviewable orders'
    };
  }
};
export const getUserOrders = orderService.getUserOrders;