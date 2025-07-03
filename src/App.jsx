import React from "react";
import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
// Pastikan path ini benar sesuai struktur folder Anda
import { useAuth } from "./pages/contexts/AuthContext"; 

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
//import AdminLayout from "./layouts/AdminLayout"; // Uncomment jika Anda punya AdminLayout

// Assets
import "./assets/tailwind.css";

// Lazy load pages
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

// Komponen untuk fallback saat lazy loading
const SuspenseLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-xl">Loading...</div>
  </div>
);

// Komponen untuk melindungi rute berdasarkan role
const ProtectedRoute = ({ requiredRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <SuspenseLoader />;
  }

  // Jika tidak ada user, arahkan ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Jika role dibutuhkan dan role user tidak sesuai, arahkan ke halaman utama
  if (requiredRole && profile?.role !== requiredRole) {
    // Arahkan admin ke dashboard mereka, customer ke home
    const redirectPath = profile?.role === 'admin' ? '/admin/dashboard' : '/';
    return <Navigate to={redirectPath} replace />;
  }
  
  // Jika semua kondisi terpenuhi, tampilkan kontennya
  return <Outlet />;
};

// Komponen untuk rute tamu (hanya bisa diakses jika belum login)
const GuestRoute = () => {
    const { user, loading } = useAuth();
    if (loading) {
        return <SuspenseLoader />;
    }
    // Jika sudah ada user, arahkan ke halaman utama, jangan tampilkan login/register lagi
    return user ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Routes>
          {/* --- Rute Publik --- */}
          {/* HomePage bisa diakses semua orang, tapi tetap pakai CustomerLayout */}
          <Route 
            path="/" 
            element={
              <CustomerLayout>
                <HomePage />
              </CustomerLayout>
            } 
          />

          {/* --- Rute untuk Tamu (belum login) --- */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* --- Rute untuk Customer (harus login & role 'customer') --- */}
          <Route element={<ProtectedRoute requiredRole="customer" />}>
            <Route element={<CustomerLayout />}>
              {/* HomePage sudah publik, jadi tidak perlu di sini lagi */}
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              {/* Tambahkan rute customer lainnya di sini */}
            </Route>
          </Route>

          {/* --- Rute untuk Admin (harus login & role 'admin') --- */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            {/* Jika punya AdminLayout, bisa dibungkus di sini */}
            {/* <Route element={<AdminLayout />}> */}
              <Route path="/admin/dashboard" element={<AdminHome />} />
              <Route path="/admin/product" element={<AdminProduct />} />
              <Route path="/admin/customer" element={<CustomerPage />} />
              <Route path="/admin/order" element={<OrderDashboard />} />
              <Route path="/admin/history" element={<HistoryPage />} />
            {/* </Route> */}
          </Route>

          {/* --- Rute Fallback --- */}
          {/* Jika halaman tidak ditemukan, arahkan ke halaman utama */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;