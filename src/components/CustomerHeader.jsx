// src/layouts/CustomerHeader.jsx (MODIFIED)

import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, Search, Menu, X, User, Settings, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../pages/contexts/AuthContext"; // Sesuaikan path jika perlu

const CustomerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, profile, logout } = useAuth(); // Tambahkan profile untuk mengambil nama
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* Top Banner - Hanya tampil jika BELUM login */}
      {!user && (
        <div className="bg-black text-white text-center py-2 text-sm relative">
          <span>Sign up and get 20% off your first order. </span>
          <Link to="/register" className="underline hover:no-underline">
            Sign Up Now
          </Link>
        </div>
      )}

      {/* Main Header - Dibuat sticky agar tetap di atas saat scroll */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/images/logo.png"
                alt="Logo Lemari Lama"
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-2xl font-bold text-black hidden sm:block">
                Lemari Lama
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8 ml-8">
              <NavLink to="/products" className="text-gray-700 hover:text-black font-medium">
                Shop
              </NavLink>
              <NavLink to="/on-sale" className="text-gray-700 hover:text-black font-medium">
                On Sale
              </NavLink>
              <NavLink to="/new-arrivals" className="text-gray-700 hover:text-black font-medium">
                New Arrivals
              </NavLink>
              <NavLink to="/brands" className="text-gray-700 hover:text-black font-medium">
                Brands
              </NavLink>
            </nav>

            {/* Search Bar (Desktop) */}
            <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              <Link
                to="/cart"
                className="p-2 rounded-full hover:bg-gray-100 relative inline-block"
              >
                <ShoppingCart size={24} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  0
                </span>
              </Link>
              
              {/* Tampilkan Tombol Login atau User Dropdown */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <User size={24} />
                    <span className="hidden sm:block text-gray-700 font-medium">
                      {profile?.name || user.email?.split('@')[0] || 'User'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings size={18} />
                        <span>Pengaturan</span>
                      </Link>
                      <button
                        onClick={confirmLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                      >
                        <LogOut size={18} />
                        <span>Keluar</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors font-medium hidden sm:block">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-2">
              <NavLink 
                to="/products" 
                className="block py-2 text-gray-700 hover:text-black font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </NavLink>
              <NavLink 
                to="/on-sale" 
                className="block py-2 text-gray-700 hover:text-black font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                On Sale
              </NavLink>
              <NavLink 
                to="/new-arrivals" 
                className="block py-2 text-gray-700 hover:text-black font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                New Arrivals
              </NavLink>
              <NavLink 
                to="/brands" 
                className="block py-2 text-gray-700 hover:text-black font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Brands
              </NavLink>
              
              {/* Search Bar (Mobile) */}
              <div className="pt-2 pb-2">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Mobile User Menu */}
              {user && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 py-2 text-gray-700 hover:text-black font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>Pengaturan</span>
                  </Link>
                  <button
                    onClick={() => {
                      confirmLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 py-2 text-gray-700 hover:text-black font-medium w-full text-left"
                  >
                    <LogOut size={18} />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Konfirmasi Keluar
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin keluar dari akun Anda?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerHeader;