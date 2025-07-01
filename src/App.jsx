// App.jsx - Fixed version
import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import "./assets/tailwind.css";
// Remove AuthLayout import since it's not being used correctly

// Lazy load components
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Products = React.lazy(() => import("./pages/Products"));
const AdminProduct = React.lazy(() => import("./pages/AdminProduct"));
const AdminHome = React.lazy(() => import("./pages/AdminHome"));
const CustomerPage = React.lazy(() => import("./pages/CustomerPage"));
const OrderDashboard = React.lazy(() => import("./pages/OrderDashboard"));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));


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

// Wrapper component for auth pages (Login/Register)
const AuthPageWrapper = ({ Component }) => (
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
          path="/admin/dashboard"
          element={<AdminPageWrapper Component={AdminHome} />}
        />
        <Route
          path="/admin/product"
          element={<AdminPageWrapper Component={AdminProduct} />}
        />
        <Route
          path="/admin/customer"
          element={<AdminPageWrapper Component={CustomerPage} />}
        />
        <Route
          path="/admin/order"
          element={<AdminPageWrapper Component={OrderDashboard} />}
        />
        <Route
          path="/admin/history"
          element={<AdminPageWrapper Component={HistoryPage} />}
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
        <Route
          path="/cart"
          element={<CustomerPageWrapper Component={Cart} />}
        />

        {/* Auth Routes - No Layout (Auth components have their own layout) */}
        <Route
          path="/login"
          element={<AuthPageWrapper Component={Login} />}
        />
        <Route
          path="/register"
          element={<AuthPageWrapper Component={Register} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;