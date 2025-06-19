import React from 'react';
import CustomerHeader from '../components/CustomerHeader';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col"> {/* Tambahkan flex-col */}
      <CustomerHeader />
      <main className="flex-1 overflow-y-auto"> {/* Pastikan bisa scroll */}
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;