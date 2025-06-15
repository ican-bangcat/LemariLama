// CustomerLayout.jsx - Slightly improved version
import React from 'react';
import CustomerHeader from '../components/CustomerHeader';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader />
      <main className="w-full">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;