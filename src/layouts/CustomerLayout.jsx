import React from 'react';
import { Outlet } from 'react-router-dom'; // PASTIKAN Outlet DI-IMPORT
import CustomerHeader from '../components/CustomerHeader'; // Sesuaikan path jika perlu

const Footer = () => (
  <footer className="bg-gray-100 py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
      <p>Lemari Lama © 2024, All Rights Reserved</p>
    </div>
  </footer>
);

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CustomerHeader />
      <main className="flex-grow">
        {/* Di sinilah semua konten halaman (HomePage, Dashboard, dll) akan muncul */}
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default CustomerLayout;
