import React, { useState } from 'react';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';

const CustomerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-sm relative">
        <span>Sign up and get 20% off your first order. </span>
        <button className="underline hover:no-underline">Sign Up Now</button>
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300">
          ×
        </button>
      </div>
      
      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">SHOP.CO</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8 ml-8">
              <a href="#" className="text-gray-700 hover:text-black font-medium">Shop</a>
              <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">On Sale</a>
              <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">New Arrivals</a>
              <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Brands</a>
            </nav>

            {/* Search Bar (Desktop) */}
            <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search */}
              <button className="lg:hidden p-2 rounded-full hover:bg-gray-100">
                <Search size={20} />
              </button>
              
              {/* Shopping Cart */}
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  0
                </span>
              </button>
              
              {/* Login Button */}
              <button className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors font-medium">
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-4 pt-2 pb-3 space-y-1 bg-white">
              {/* Mobile Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              
              {/* Mobile Navigation Links */}
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-black font-medium">Shop</a>
              <a href="#" className="block px-3 py-2 text-blue-500 hover:text-blue-600 font-medium">On Sale</a>
              <a href="#" className="block px-3 py-2 text-blue-500 hover:text-blue-600 font-medium">New Arrivals</a>
              <a href="#" className="block px-3 py-2 text-blue-500 hover:text-blue-600 font-medium">Brands</a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default CustomerHeader;