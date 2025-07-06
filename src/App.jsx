import React from "react";
import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./pages/contexts/AuthContext";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";

// Halaman
const HomePage = React.lazy(() => import("./pages/HomePage"));
const CustomerDashboard = React.lazy(() => import("./pages/CustomerDashboard"));
const Products = React.lazy(() => import("./pages/Products"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));

const SuspenseLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-xl">Loading...</div>
  </div>
);

// PERBAIKAN: Hilangkan loading check di sini karena sudah di AuthContext
const ProtectedRoute = () => {
  const { user } = useAuth(); // Hapus loading dari sini
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const GuestRoute = () => {
  const { user } = useAuth(); // Hapus loading dari sini
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Routes>
          {/* RUTE PUBLIK */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Products />} />
          </Route>

          {/* RUTE TAMU */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* RUTE PRIVAT */}
          <Route element={<ProtectedRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/cart" element={<Cart />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;