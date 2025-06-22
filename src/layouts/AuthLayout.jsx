import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// AuthLayout Component
// AuthLayout Component - Updated for centered card
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};


export default AuthLayout;