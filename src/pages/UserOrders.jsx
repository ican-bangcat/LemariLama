import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../pages/contexts/AuthContext";
import { orderService } from "../pages/services/orderService";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentProofs, setPaymentProofs] = useState([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await orderService.getUserOrders(user.id);

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          setOrders(data || []);
        }
      } catch (err) {
        console.error("Exception while fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };
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
      // Jika bank transfer/e-wallet = merah (belum dibayar)
      if (paymentMethod === "bank_transfer" || paymentMethod === "e_wallet") {
        return "bg-red-100 text-red-800";
      }
      // Jika COD = kuning (menunggu konfirmasi)
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
      // Jika payment method bank transfer atau e-wallet, artinya belum dibayar
      if (paymentMethod === "bank_transfer" || paymentMethod === "e_wallet") {
        return "Belum Dibayar";
      }
      // Jika COD atau method lain, artinya menunggu konfirmasi admin
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

 const handleCancelOrder = async (orderId) => {
  if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
    return;
  }

  setCancelling(true);
  try {
    // Tambahkan user.id sebagai parameter
    const { data, error } = await orderService.cancelOrder(orderId, user.id);
    
    if (error) {
      alert('Gagal membatalkan pesanan: ' + error);
      return;
    }

    // Update local state
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'cancelled', updated_at: new Date().toISOString() }
        : order
    ));
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'cancelled', updated_at: new Date().toISOString() });
    }

    alert('Pesanan berhasil dibatalkan');
  } catch (error) {
    console.error('Error cancelling order:', error);
    alert('Terjadi kesalahan saat membatalkan pesanan');
  } finally {
    setCancelling(false);
  }
};

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pesanan Saya
          </h1>
          <p className="text-gray-600">Kelola dan lacak semua pesanan Anda</p>
        </div>

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
                onClick={() => (window.location.href = "/products")}
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
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.product_price * item.quantity)}
                        </p>
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

                  {/* Quick Actions - Enhanced */}
                  <div className="flex flex-wrap gap-3 mt-4">
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

                    {order.payment_status === "paid" && (
                      <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span>Pembayaran dikonfirmasi</span>
                      </div>
                    )}

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

        {/* Order Detail Modal */}
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

                {/* Payment Proof Section - Enhanced */}
                {(selectedOrder.payment_method === "bank_transfer" ||
                  selectedOrder.payment_method === "e_wallet") && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Informasi Pembayaran
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        {selectedOrder.payment_method === "bank_transfer" ? (
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-blue-600" />
                        )}
                        <h4 className="font-medium text-blue-900">
                          {selectedOrder.payment_method === "bank_transfer"
                            ? "Transfer Bank"
                            : "E-Wallet"}
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {selectedOrder.payment_method === "bank_transfer" &&
                          paymentMethods.bank_transfer.accounts.map(
                            (account, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 bg-white rounded border"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {account.bank}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {account.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-mono text-lg font-semibold">
                                    {account.number}
                                  </p>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        account.number
                                      );
                                      alert("Nomor rekening berhasil disalin!");
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Salin Nomor
                                  </button>
                                </div>
                              </div>
                            )
                          )}

                        {selectedOrder.payment_method === "e_wallet" && (
                          <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.e_wallet.accounts.map(
                              (account, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center p-3 bg-white rounded border"
                                >
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {account.provider}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {account.name}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-mono text-sm font-semibold">
                                      {account.number}
                                    </p>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          account.number
                                        );
                                        alert("Nomor berhasil disalin!");
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Salin Nomor
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Penting:</strong> Transfer sesuai dengan total
                          pembayaran sebesar{" "}
                          <span className="font-semibold">
                            {formatPrice(selectedOrder.total_amount)}
                          </span>{" "}
                          dan upload bukti pembayaran untuk mempercepat
                          konfirmasi.
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-3">
                      Bukti Pembayaran
                    </h3>

                    {canUploadProof(selectedOrder) && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Upload Bukti Pembayaran
                            </h4>
                            <p className="text-sm text-blue-700 mb-4">
                              Silakan upload bukti pembayaran Anda untuk
                              mempercepat proses konfirmasi pesanan. File yang
                              didukung: JPG, PNG, GIF, atau PDF (maksimal 5MB)
                            </p>
                            <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                              <Upload className="w-4 h-4" />
                              <span>
                                {uploadingProof
                                  ? "Mengunggah..."
                                  : "Pilih File"}
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
                            {uploadingProof && (
                              <div className="mt-3 flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm text-blue-600">
                                  Sedang mengunggah file...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentProofs.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          Riwayat Upload
                        </h4>
                        {paymentProofs.map((proof) => (
                          <div
                            key={proof.id}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <FileImage className="w-6 h-6 text-gray-500" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {proof.file_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Diunggah pada {formatDate(proof.created_at)}
                                  </p>
                                  {proof.admin_notes && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                      <p className="font-medium text-yellow-800">
                                        Catatan Admin:
                                      </p>
                                      <p className="text-yellow-700">
                                        {proof.admin_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getProofStatusIcon(proof.status)}
                                <span
                                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    proof.status === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : proof.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {getProofStatusText(proof.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedOrder.payment_method !== "cod" &&
                      paymentProofs.length === 0 &&
                      !canUploadProof(selectedOrder) && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">
                            Belum ada bukti pembayaran yang diunggah
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* Order Items */}
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
                        <div className="text-right">
                          <p className="font-medium">
                            {formatPrice(item.product_price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
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

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex space-x-3">
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
      </div>
    </div>
  );
};

export default UserOrders;
