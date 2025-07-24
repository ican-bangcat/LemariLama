import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Eye,
  X,
  Calendar,
  Upload,
  FileImage,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  CreditCard,
  Clock,
  Smartphone,
  Truck,
  Star,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { useAuth } from "../pages/contexts/AuthContext";
import {
  orderService,
  confirmDelivery,
  getReviewableOrders,
  getUserOrders,
} from "../pages/services/orderService";
import ReviewModal from "../components/ReviewModal"; // Import ReviewModal
const UserOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentProofs, setPaymentProofs] = useState([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  // Review System States
  const [reviewableItems, setReviewableItems] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  // Payment methods configuration
  const paymentMethods = {
    bank_transfer: {
      title: "Transfer Bank",
      accounts: [
        { bank: "BCA", number: "1234567890", name: "Lemari Lama" },
        { bank: "Mandiri", number: "9876543210", name: "Lemari Lama" },
        { bank: "BNI", number: "0987654321", name: "Lemari Lama" },
        { bank: "BRI", number: "1357924680", name: "Lemari Lama" },
      ],
    },
    e_wallet: {
      title: "E-Wallet",
      accounts: [
        { provider: "GoPay", number: "0895621336473", name: "Lemari Lama" },
        { provider: "OVO", number: "0895621336473", name: "Lemari Lama" },
        { provider: "DANA", number: "0895621336473", name: "Lemari Lama" },
        { provider: "ShopeePay", number: "0895621336473", name: "Lemari Lama" },
      ],
    },
  };

  // Load orders and reviewable items
  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Load orders
        const response = await getUserOrders(user.id);
        if (response.success) {
          setOrders(response.data);
        } else {
          setError(response.error || "Failed to load orders");
        }

        // Load reviewable items
        // const reviewableResponse = await getReviewableOrders(user.id);
        // if (reviewableResponse.success) {
        //   const allReviewableItems = reviewableResponse.data.flatMap(
        //     (order) =>
        //       order.reviewable_items?.map((item) => ({
        //         ...item,
        //         order_id: order.id,
        //       })) || []
        //   );
        //   setReviewableItems(allReviewableItems);
        // }
        await reloadReviewableItems();
      } catch (err) {
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  // Fetch payment proofs when order is selected
  useEffect(() => {
    const fetchPaymentProofs = async () => {
      if (!selectedOrder) return;

      try {
        const { data, error } = await orderService.getPaymentProofs(
          selectedOrder.id
        );
        if (error) {
          console.error("Error fetching payment proofs:", error);
        } else {
          setPaymentProofs(data || []);
        }
      } catch (err) {
        console.error("Exception while fetching payment proofs:", err);
      }
    };

    fetchPaymentProofs();
  }, [selectedOrder]);

  // Handle confirm delivery - NEW FEATURE
  const handleConfirmDelivery = async (orderId) => {
    setConfirmingDelivery(true);
    try {
      const response = await confirmDelivery(orderId, user.id);

      if (response.success) {
        // Update order status in local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "delivered",
                  updated_at: new Date().toISOString(),
                }
              : order
          )
        );

        // Update selected order if it's the same
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: "delivered",
            updated_at: new Date().toISOString(),
          });
        }

        // Reload reviewable items
        const reviewableResponse = await getReviewableOrders(user.id);
        if (reviewableResponse.success) {
          const allReviewableItems = reviewableResponse.data.flatMap(
            (order) =>
              order.reviewable_items?.map((item) => ({
                ...item,
                order_id: order.id,
              })) || []
          );
          setReviewableItems(allReviewableItems);
        }

        alert("Pesanan berhasil dikonfirmasi sebagai diterima!");
      } else {
        alert(response.error || "Gagal mengkonfirmasi pesanan");
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      alert("Terjadi kesalahan saat mengkonfirmasi pesanan");
    } finally {
      setConfirmingDelivery(false);
    }
  };
  // Reload reviewable items after actions
  const reloadReviewableItems = async () => {
    try {
      const reviewableResponse = await getReviewableOrders(user.id);
      if (reviewableResponse.success) {
        const allReviewableItems = reviewableResponse.data.flatMap(
          (order) =>
            order.reviewable_items?.map((item) => ({
              ...item,
              order_id: order.id,
            })) || []
        );
        setReviewableItems(allReviewableItems);
      }
    } catch (error) {
      console.error("Error reloading reviewable items:", error);
    }
  };
  // Handle review - NEW FEATURE
  const handleReview = (item) => {
    setSelectedItem({
      ...item,
      order_number:
        orders.find((order) => order.id === item.order_id)?.order_number ||
        "Unknown",
    });
    setShowReviewModal(true);
  };
  // Handle review success - NEW
  const handleReviewSuccess = async () => {
    setShowReviewModal(false);
    setSelectedItem(null);

    // Reload reviewable items to update the UI
    await reloadReviewableItems();

    // Show success message
    alert("Review berhasil dikirim! Terima kasih atas feedback Anda.");
  };
  // Handle view review - NEW FEATURE
  const handleViewReview = (productId) => {
    navigate(`/product/${productId}#reviews`);
  };

  // Check if product already reviewed - NEW FEATURE
  const isProductReviewed = (productId, orderId) => {
    return !reviewableItems.some(
      (item) => item.product_id === productId && item.order_id === orderId
    );
  };

  // Utility functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Menunggu Konfirmasi",
      confirmed: "Dikonfirmasi",
      processing: "Diproses",
      shipped: "Dikirim",
      delivered: "Diterima",
      cancelled: "Dibatalkan",
    };
    return texts[status] || status;
  };

  // Smart payment status color based on payment method
  const getPaymentStatusColor = (status, paymentMethod = null) => {
    if (status === "pending") {
      if (paymentMethod === "bank_transfer" || paymentMethod === "e_wallet") {
        return "bg-red-100 text-red-800";
      }
      return "bg-yellow-100 text-yellow-800";
    }

    const colors = {
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Smart payment status text based on payment method
  const getPaymentStatusText = (status, paymentMethod = null) => {
    if (status === "pending") {
      if (paymentMethod === "bank_transfer" || paymentMethod === "e_wallet") {
        return "Belum Dibayar";
      }
      return "Menunggu Konfirmasi";
    }

    const texts = {
      paid: "Sudah Dibayar",
      failed: "Gagal",
      refunded: "Refund",
    };
    return texts[status] || status;
  };

  const getProofStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getProofStatusText = (status) => {
    const texts = {
      pending: "Menunggu Verifikasi",
      approved: "Disetujui",
      rejected: "Ditolak",
    };
    return texts[status] || status;
  };

  const canUploadProof = (order) => {
    return (
      order.status === "pending" &&
      order.payment_status === "pending" &&
      (order.payment_method === "bank_transfer" ||
        order.payment_method === "e_wallet")
    );
  };

  const canCancelOrder = (order) => {
    return order.status === "pending";
  };

  // File upload handler
  const handleFileUpload = async (file, orderId = null) => {
    const targetOrderId = orderId || selectedOrder?.id;
    if (!targetOrderId || !file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("File harus berformat JPG, PNG, GIF, atau PDF");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploadingProof(true);
    try {
      const { data, error } = await orderService.uploadPaymentProof(
        targetOrderId,
        file,
        user.id
      );

      if (error) {
        alert("Gagal mengunggah bukti pembayaran: " + error);
        return;
      }

      // If modal is open, refresh payment proofs
      if (selectedOrder && selectedOrder.id === targetOrderId) {
        const { data: proofs } = await orderService.getPaymentProofs(
          targetOrderId
        );
        setPaymentProofs(proofs || []);
      }

      alert("Bukti pembayaran berhasil diunggah!");
    } catch (error) {
      console.error("Error uploading proof:", error);
      alert("Terjadi kesalahan saat mengunggah bukti pembayaran");
    } finally {
      setUploadingProof(false);
    }
  };

  // Cancel order handler
  const handleCancelOrder = async (orderId) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
      return;
    }

    setCancelling(true);
    try {
      const { data, error } = await orderService.cancelOrder(orderId, user.id);

      if (error) {
        alert("Gagal membatalkan pesanan: " + error);
        return;
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: "cancelled",
                updated_at: new Date().toISOString(),
              }
            : order
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: "cancelled",
          updated_at: new Date().toISOString(),
        });
      }

      alert("Pesanan berhasil dibatalkan");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Terjadi kesalahan saat membatalkan pesanan");
    } finally {
      setCancelling(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items?.some((item) =>
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: "all", label: "Semua Status", count: orders.length },
    {
      value: "pending",
      label: "Menunggu",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      value: "confirmed",
      label: "Dikonfirmasi",
      count: orders.filter((o) => o.status === "confirmed").length,
    },
    {
      value: "processing",
      label: "Diproses",
      count: orders.filter((o) => o.status === "processing").length,
    },
    {
      value: "shipped",
      label: "Dikirim",
      count: orders.filter((o) => o.status === "shipped").length,
    },
    {
      value: "delivered",
      label: "Diterima",
      count: orders.filter((o) => o.status === "delivered").length,
    },
  ];

  const getProductImage = (orderItem) => {
    if (orderItem.products?.images && orderItem.products.images.length > 0) {
      const images = orderItem.products.images;
      return Array.isArray(images) ? images[0] : images;
    }
    return "https://placehold.co/64x64/E2E8F0/4A5568?text=No+Image";
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Orders
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to view your order history.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Login Now
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
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pesanan Saya
          </h1>
          <p className="text-gray-600">Kelola dan lacak semua pesanan Anda</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nomor pesanan atau nama produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="lg:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all"
                ? "Tidak Ada Pesanan Ditemukan"
                : "Belum Ada Pesanan"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Mulai berbelanja sekarang untuk membuat pesanan pertama Anda"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mulai Belanja
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.order_number}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.payment_status,
                          order.payment_method
                        )}`}
                      >
                        {getPaymentStatusText(
                          order.payment_status,
                          order.payment_method
                        )}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat detail"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.order_items?.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={getProductImage(item)}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/64x64/E2E8F0/4A5568?text=No+Image";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product_name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {item.size && <span>Size: {item.size}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.product_price * item.quantity)}
                          </p>

                          {/* Review Button - NEW FEATURE */}
                          {order.status === "delivered" && (
                            <div>
                              {isProductReviewed(item.product_id, order.id) ? (
                                <button
                                  onClick={() =>
                                    handleViewReview(item.product_id)
                                  }
                                  className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Lihat Review</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleReview({
                                      ...item,
                                      order_id: order.id,
                                      order_number: order.order_number,
                                    })
                                  }
                                  className="flex items-center space-x-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full hover:bg-yellow-600 transition-colors"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Review</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {order.order_items?.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.order_items.length - 2} produk lainnya
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      Total Pesanan:
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>

                  {/* Quick Actions - Enhanced with Review Features */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {/* Confirm Delivery Button - NEW FEATURE */}
                    {order.status === "shipped" && (
                      <button
                        onClick={() => handleConfirmDelivery(order.id)}
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

                    {/* Upload Payment Proof */}
                    {canUploadProof(order) && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4" />
                          <span>Menunggu pembayaran</span>
                        </div>
                        <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>
                            {uploadingProof ? "Uploading..." : "Upload Bukti"}
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              e.target.files[0] &&
                              handleFileUpload(e.target.files[0], order.id)
                            }
                            disabled={uploadingProof}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Payment Confirmed Status */}
                    {order.payment_status === "paid" && (
                      <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>Pembayaran dikonfirmasi</span>
                      </div>
                    )}

                    {/* Delivered Status - NEW FEATURE */}
                    {order.status === "delivered" && (
                      <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>Pesanan Selesai</span>
                      </div>
                    )}

                    {/* Cancel Order */}
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancelling}
                        className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {cancelling ? "Membatalkan..." : "Batalkan"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Detail Modal - Same as before but with review features */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Detail Pesanan</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Informasi Pesanan
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nomor Pesanan:</span>
                        <span className="font-medium">
                          {selectedOrder.order_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span>{formatDate(selectedOrder.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {getStatusText(selectedOrder.status)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Status Pembayaran:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            selectedOrder.payment_status,
                            selectedOrder.payment_method
                          )}`}
                        >
                          {getPaymentStatusText(
                            selectedOrder.payment_status,
                            selectedOrder.payment_method
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Metode Pembayaran:
                        </span>
                        <span className="capitalize">
                          {selectedOrder.payment_method?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Total Pembayaran
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>
                          {formatPrice(
                            selectedOrder.total_amount -
                              (selectedOrder.shipping_cost || 0)
                          )}
                        </span>
                      </div>
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Diskon</span>
                          <span>
                            -{formatPrice(selectedOrder.discount_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ongkos Kirim:</span>
                        <span>
                          {formatPrice(selectedOrder.shipping_cost || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>{formatPrice(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Proof Section - Same as before */}
                {(selectedOrder.payment_method === "bank_transfer" ||
                  selectedOrder.payment_method === "e_wallet") && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Informasi Pembayaran
                    </h3>
                    {/* Payment methods and proof upload UI - same as before */}
                    {/* ... existing payment proof section ... */}
                  </div>
                )}

                {/* Order Items with Review Options - ENHANCED */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Produk yang Dipesan
                  </h3>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <img
                          src={getProductImage(item)}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/64x64/E2E8F0/4A5568?text=No+Image";
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.product_name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            <span>Qty: {item.quantity}</span>
                            <span>
                              Harga: {formatPrice(item.product_price)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-2">
                          <p className="font-medium">
                            {formatPrice(item.product_price * item.quantity)}
                          </p>

                          {/* Review Button in Modal - NEW FEATURE */}
                          {selectedOrder.status === "delivered" && (
                            <div>
                              {isProductReviewed(
                                item.product_id,
                                selectedOrder.id
                              ) ? (
                                <button
                                  onClick={() =>
                                    handleViewReview(item.product_id)
                                  }
                                  className="flex items-center space-x-2 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Lihat Review</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleReview({
                                      ...item,
                                      order_id: selectedOrder.id,
                                      order_number: selectedOrder.order_number,
                                    })
                                  }
                                  className="flex items-center space-x-2 text-sm bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                                >
                                  <Star className="w-4 h-4" />
                                  <span>Tulis Review</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address - Same as before */}
                {selectedOrder.shipping_address && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Alamat Pengiriman
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">
                        {selectedOrder.shipping_address.recipient_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.shipping_address.phone}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedOrder.shipping_address.address_line1}
                      </p>
                      {selectedOrder.shipping_address.address_line2 && (
                        <p className="text-sm text-gray-600">
                          {selectedOrder.shipping_address.address_line2}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {selectedOrder.shipping_address.city},{" "}
                        {selectedOrder.shipping_address.state}{" "}
                        {selectedOrder.shipping_address.postal_code}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Enhanced with Review Features */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex space-x-3">
                    {/* Confirm Delivery in Modal - NEW FEATURE */}
                    {selectedOrder.status === "shipped" && (
                      <button
                        onClick={() => handleConfirmDelivery(selectedOrder.id)}
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

                    {/* Upload Proof */}
                    {canUploadProof(selectedOrder) && (
                      <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>
                          {uploadingProof
                            ? "Mengunggah..."
                            : "Upload Bukti Pembayaran"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            e.target.files[0] &&
                            handleFileUpload(e.target.files[0])
                          }
                          disabled={uploadingProof}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {/* Cancel Order */}
                    {canCancelOrder(selectedOrder) && (
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        disabled={cancelling}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
                        </span>
                      </button>
                    )}

                    {/* Close Modal */}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal Placeholder - Will be implemented next */}
        {/* Review Modal - UPDATED with real component */}
        {showReviewModal && selectedItem && (
          <ReviewModal
            item={selectedItem}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedItem(null);
            }}
            onSuccess={handleReviewSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default UserOrders;
