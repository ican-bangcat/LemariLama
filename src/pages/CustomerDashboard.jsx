// src/pages/CustomerDashboard.jsx (NEW FILE)

import React from 'react';

const CustomerDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-black mb-4">
        Welcome to Your Dashboard
      </h1>
      <p className="text-gray-600">
        This is your main page now that you are logged in. From here, you can manage your profile, view orders, and more.
      </p>
      {/* Di sini Anda bisa menambahkan komponen lain untuk dashboard */}
    </div>
  );
};

export default CustomerDashboard;