import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Package, Calendar, User, CreditCard, MapPin, X } from 'lucide-react';
import { orderService } from '../pages/services/orderService';
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    totalRevenue: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Load orders from Supabase
  useEffect(() => {
    console.log('=== LOADING ORDERS ===');
    console.log('Current page:', currentPage);
    console.log('Filter status:', filterStatus);
    loadOrders();
    loadStats();
  }, [currentPage, filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('Calling orderService.getAllOrders...');
      const status = filterStatus === 'all' ? null : filterStatus;
      const { data, error, total: totalCount, hasMore: moreData } = await orderService.getAllOrders(
        currentPage, 
        20, 
        status
      );

      console.log('Service response:', { data, error, totalCount, moreData });

      if (error) {
        console.error('Error loading orders:', error);
        alert('Error loading orders: ' + error);
        return;
      }

      console.log('Orders loaded successfully:', data?.length || 0);
      setOrders(data || []);
      setTotal(totalCount || 0);
      setHasMore(moreData);
    } catch (error) {    
      console.error('Error loading orders:', error);
      alert('Exception loading orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    console.log('Loading stats...');
    const { data, error } = await orderService.getOrderStats();
    if (data && !error) {
      console.log('Stats loaded:', data);
      setStats(data);
    } else {
      console.error('Error loading stats:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getPaymentMethodText = (method) => {
    const methods = {
      bank_transfer: 'Transfer Bank',
      e_wallet: 'E-Wallet',
      cod: 'COD (Bayar di Tempat)',
      credit_card: 'Kartu Kredit'
    };
    return methods[method] || method;
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const { data, error } = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (error) {
        console.error('Error updating status:', error);
        alert('Gagal mengubah status pesanan');
        return;
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, updated_at: new Date().toISOString() });
      }

      // Reload stats to update counts
      loadStats();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    }
  };

  const loadOrderDetail = async (orderId) => {
    try {
      const { data, error } = await orderService.getOrderById(orderId);
      
      if (error) {
        console.error('Error loading order detail:', error);
        alert('Gagal memuat detail pesanan');
        return;
      }

      setSelectedOrder(data);
    } catch (error) {
      console.error('Error loading order detail:', error);
      alert('Terjadi kesalahan saat memuat detail');
    }
  };

  // Fixed search filtering
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in order number
    if (order.order_number?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in shipping address recipient name
    if (order.shipping_address?.recipient_name?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in profile full name (if available)
    if (order.profiles?.full_name?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in profile phone (if available)
    if (order.profiles?.phone?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });

  // Fixed status options counts
  const statusOptions = [
    { value: 'all', label: 'Semua Status', count: total },
    { value: 'pending', label: 'Menunggu', count: orders.filter(o => o.status === 'pending').length },
    { value: 'confirmed', label: 'Dikonfirmasi', count: orders.filter(o => o.status === 'confirmed').length },
    { value: 'processing', label: 'Diproses', count: orders.filter(o => o.status === 'processing').length },
    { value: 'shipped', label: 'Dikirim', count: orders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Diterima', count: orders.filter(o => o.status === 'delivered').length }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 fixed top-0 left-0 h-screen z-10 bg-white shadow-md">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-60 bg-gray-100">
        <Topbar />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Pesanan</h1>
            <p className="text-gray-600">Kelola semua pesanan customer</p>
          </div>

          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-sm text-blue-700">
              Debug: Total orders: {total}, Current page: {currentPage}, 
              Orders loaded: {orders.length}, Filter: {filterStatus}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Menunggu Konfirmasi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pesanan Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari nomor pesanan atau nama customer..."
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
                    onChange={(e) => {
                      console.log('Status filter changed to:', e.target.value);
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && currentPage === 1 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat pesanan...</p>
            </div>
          ) : (
            <>
              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pesanan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.order_number}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.order_items ? order.order_items.length : 0} item(s)
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="w-8 h-8 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.shipping_address?.recipient_name || 
                                   order.profiles?.full_name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.shipping_address?.phone || 
                                   order.profiles?.phone || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {order.payment_status === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(order.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => loadOrderDetail(order.id)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredOrders.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {orders.length === 0 ? 'Tidak ada pesanan ditemukan' : 'Tidak ada pesanan yang cocok dengan pencarian'}
                    </p>
                    {orders.length === 0 && (
                      <button 
                        onClick={() => loadOrders()}
                        className="mt-2 text-blue-600 hover:text-blue-800"
                      >
                        Refresh data
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {total > 20 && (
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                      Page {currentPage} of {Math.ceil(total / 20)}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasMore}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Detail Pesanan - {selectedOrder.order_number}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informasi Pesanan</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nomor Pesanan:</span>
                      <span className="font-medium">{selectedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span>{formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode Pembayaran:</span>
                      <span>{getPaymentMethodText(selectedOrder.payment_method)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="pending">Menunggu Konfirmasi</option>
                        <option value="confirmed">Dikonfirmasi</option>
                        <option value="processing">Diproses</option>
                        <option value="shipped">Dikirim</option>
                        <option value="delivered">Diterima</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Pembayaran:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedOrder.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.payment_status === 'paid' ? 'Sudah Dibayar' : 'Belum Dibayar'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold">Alamat Pengiriman</h3>
                  </div>
                  {selectedOrder.shipping_address && (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{selectedOrder.shipping_address.recipient_name}</p>
                      <p>{selectedOrder.shipping_address.phone}</p>
                      <p>{selectedOrder.shipping_address.address_line1}</p>
                      <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                    </div>
                  )}
                  
                  {selectedOrder.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-1">Catatan:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Produk yang Dipesan</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          {item.size && <span>Size: {item.size}</span>}
                          <span>Qty: {item.quantity}</span>
                          <span>Harga: {formatPrice(item.product_price)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatPrice((selectedOrder.total_amount || 0) - (selectedOrder.shipping_cost || 0))}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Ongkos Kirim:</span>
                  <span>{formatPrice(selectedOrder.shipping_cost || 0)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Diskon:</span>
                    <span className="text-red-600">-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(selectedOrder.total_amount || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;