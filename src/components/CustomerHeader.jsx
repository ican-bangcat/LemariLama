// src/layouts/CustomerHeader.jsx (MODIFIED)

import React, { useState } from "react";
import { ShoppingCart, Search, Menu, X, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../pages/contexts/AuthContext"; // Sesuaikan path jika perlu

const CustomerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth(); // Dapatkan status login pengguna

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
              
              {/* Tampilkan Tombol Login atau Ikon Profil */}
              {user ? (
                 <Link to="/profile" className="p-2 rounded-full hover:bg-gray-100">
                    <User size={24} />
                 </Link>
              ) : (
                <Link to="/login" className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors font-medium hidden sm:block">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu (jika diperlukan) */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            {/* ... Isi menu mobile ... */}
          </div>
        )}
      </header>
    </>
  );
};

export default CustomerHeader;