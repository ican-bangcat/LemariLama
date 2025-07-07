import React from "react";
import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./pages/contexts/AuthContext"; // Sesuaikan path jika perlu

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
// import AdminLayout from "./layouts/AdminLayout"; // Anda bisa membuat layout khusus untuk admin nanti

// Halaman Publik & Customer
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Products = React.lazy(() => import("./pages/Products"));
const Cart = React.lazy(() => import("./pages/Cart"));
const CustomerDashboard = React.lazy(() => import("./pages/CustomerDashboard"));

// Halaman Admin (diimpor kembali)
const AdminHome = React.lazy(() => import("./pages/AdminHome"));
const AdminProduct = React.lazy(() => import("./pages/AdminProduct"));
const CustomerPage = React.lazy(() => import("./pages/CustomerPage"));
const OrderDashboard = React.lazy(() => import("./pages/OrderDashboard"));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage"));

// Halaman Auth
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));

// --- Komponen Helper ---

const SuspenseLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-xl">Loading...</div>
  </div>
);

// Rute yang dilindungi berdasarkan peran (role)
const ProtectedRoute = ({ requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <SuspenseLoader />;
  }

  // Jika belum login, arahkan ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role yang dibutuhkan tidak cocok dengan role pengguna,
  // arahkan ke halaman utama mereka.
  if (requiredRole && profile?.role !== requiredRole) {
    const homePath = profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={homePath} replace />;
  }

  // Jika semua syarat terpenuhi, tampilkan kontennya
  return <Outlet />;
};

// Rute untuk tamu (pengguna yang belum login)
const GuestRoute = () => {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return <SuspenseLoader />;
  }

  // Jika sudah login, arahkan ke dashboard yang sesuai
  if (user) {
    const homePath = profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={homePath} replace />;
  }

  // Jika belum login, tampilkan kontennya (halaman login/register)
  return <Outlet />;
};


// --- Komponen Aplikasi Utama ---

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

          {/* RUTE CUSTOMER - hanya untuk customer yang sudah login */}
          <Route element={<ProtectedRoute requiredRole="customer" />}>
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/cart" element={<Cart />} />
              {/* Tambahkan rute customer lain di sini */}
            </Route>
          </Route>

          {/* RUTE ADMIN - hanya untuk admin yang sudah login */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            {/* Anda bisa menambahkan <AdminLayout> di sini jika perlu */}
            <Route path="/admin/dashboard" element={<AdminHome />} />
            <Route path="/admin/product" element={<AdminProduct />} />
            <Route path="/admin/customer" element={<CustomerPage />} />
            <Route path="/admin/order" element={<OrderDashboard />} />
            <Route path="/admin/history" element={<HistoryPage />} />
          </Route>

          {/* Fallback jika halaman tidak ditemukan */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
