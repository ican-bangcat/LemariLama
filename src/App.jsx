import React from "react";
import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./pages/contexts/AuthContext";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";

// Halaman
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Products = React.lazy(() => import("./pages/Products"));
const Cart = React.lazy(() => import("./pages/Cart"));
//const Profile = React.lazy(() => import("./pages/Profile")); // Tambahkan jika ada
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));

const SuspenseLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-xl">Loading...</div>
  </div>
);

// Route untuk halaman yang butuh login
const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route untuk halaman login/register (redirect jika sudah login)
const GuestRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />; // Redirect ke "/" bukan "/dashboard"
};

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Routes>
          {/* RUTE PUBLIK - bisa diakses siapa saja */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Products />} />
          </Route>

          {/* RUTE TAMU - hanya untuk yang belum login */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* RUTE PRIVAT - hanya untuk yang sudah login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/cart" element={<Cart />} />
              {/* <Route path="/profile" element={<Profile />} /> */}
              {/* Tambahkan route lain yang butuh login */}
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