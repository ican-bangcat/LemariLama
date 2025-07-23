import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { addressService } from '../pages/services/addressService';
import AddressModal from '../components/AddressModal';
import { Plus, MapPin, Edit2, Trash2, Star, StarOff } from 'lucide-react';

const UserAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setLoading(true);
    const { data, error } = await addressService.getUserAddresses(user.id);
    if (error) {
      setError(error);
    } else {
      setAddresses(data || []);
    }
    setLoading(false);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    setActionLoading(true);
    setError('');

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await addressService.updateAddress(editingAddress.id, addressData);
        if (error) {
          setError(error);
          return;
        }
      } else {
        // Add new address
        const { error } = await addressService.addAddress(user.id, addressData);
        if (error) {
          setError(error);
          return;
        }
      }

      setModalOpen(false);
      setEditingAddress(null);
      await fetchAddresses();
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan alamat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      return;
    }

    setActionLoading(true);
    const { error } = await addressService.deleteAddress(addressId);
    if (error) {
      setError(error);
    } else {
      await fetchAddresses();
    }
    setActionLoading(false);
  };

  const handleSetDefault = async (addressId) => {
    setActionLoading(true);
    const { error } = await addressService.setDefaultAddress(user.id, addressId);
    if (error) {
      setError(error);
    } else {
      await fetchAddresses();
    }
    setActionLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alamat Saya</h1>
              <p className="text-gray-600 mt-1">Kelola alamat pengiriman Anda</p>
            </div>
            <button
              onClick={handleAddAddress}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Alamat
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Alamat</h3>
              <p className="text-gray-600 mb-6">Tambahkan alamat pertama Anda untuk memudahkan proses checkout</p>
              <button
                onClick={handleAddAddress}
                className="flex items-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Alamat Sekarang
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                  address.is_default ? 'border-blue-200 bg-blue-50' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mr-3">
                        {address.label}
                      </h3>
                      {address.is_default && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="text-gray-700 space-y-1">
                      <p className="font-medium">{address.recipient_name}</p>
                      <p>{address.phone}</p>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>{address.city}, {address.state} {address.postal_code}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        disabled={actionLoading}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Jadikan alamat utama"
                      >
                        <StarOff className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEditAddress(address)}
                      disabled={actionLoading}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit alamat"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={actionLoading}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus alamat"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Address Modal */}
        <AddressModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingAddress(null);
            setError('');
          }}
          onSave={handleSaveAddress}
          address={editingAddress}
          isLoading={actionLoading}
        />
      </div>
    </div>
  );
};

export default UserAddresses;