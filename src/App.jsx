// App.jsx - Clean version with admin and products routes
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import "./assets/tailwind.css";

// Lazy load components
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Products = React.lazy(() => import("./pages/Products"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const Cart= React.lazy(() => import("./pages/Cart"));

// Wrapper component for customer pages with layout
const CustomerPageWrapper = ({ Component }) => (
  <CustomerLayout>
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <Component />
    </React.Suspense>
  </CustomerLayout>
);

// Wrapper component for admin pages (no customer layout)
const AdminPageWrapper = ({ Component }) => (
  <React.Suspense
    fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    }
  >
    <Component />
  </React.Suspense>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes - No CustomerLayout */}
        <Route 
          path="/admin" 
          element={<AdminPageWrapper Component={AdminDashboard} />} 
        />
        
        {/* Customer Routes - With CustomerLayout */}
        <Route 
          path="/" 
          element={<CustomerPageWrapper Component={HomePage} />} 
        />
        <Route 
          path="/products" 
          element={<CustomerPageWrapper Component={Products} />} 
        />
        <Route path="/cart" 
          element={<CustomerPageWrapper Component={Cart} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;