import React from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./pages/contexts/AuthContext"; // Sesuaikan path jika perlu
import { CartProvider } from "./pages/contexts/CartContext"; // Import CartProvider

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
// import AdminLayout from "./layouts/AdminLayout"; // Anda bisa membuat layout khusus untuk admin nanti

// Halaman Publik & Customer
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail")); // Tambahan baru
const Cart = React.lazy(() => import("./pages/Cart"));
const Address = React.lazy(() => import("./pages/UserAddresses"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess"));
const UserOrders = React.lazy(() => import("./pages/UserOrders"));

// Halaman Admin (diimpor kembali)
const AdminHome = React.lazy(() => import("./pages/AdminHome"));
const AdminProduct = React.lazy(() => import("./pages/AdminProduct"));
const AdminTestimonial = React.lazy(() => import("./pages/AdminTestimonial"));
const CustomerPage = React.lazy(() => import("./pages/CustomerPage"));
const AdminOrders = React.lazy(() => import("./pages/AdminOrders.jsx"));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage"));

// Halaman Auth
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));

// --- Komponen Helper ---

const SuspenseLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
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
    const homePath = profile?.role === "admin" ? "/admin/dashboard" : "/";
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
    const homePath =
      profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={homePath} replace />;
  }

  // Jika belum login, tampilkan kontennya (halaman login/register)
  return <Outlet />;
};

// --- Komponen Aplikasi Utama ---

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        {" "}
        {/* Wrap dengan CartProvider */}
        <React.Suspense fallback={<SuspenseLoader />}>
          <Routes>
            {/* RUTE PUBLIK - bisa diakses siapa saja */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />{" "}
              {/* Route baru untuk detail produk */}
            </Route>

            {/* RUTE TAMU - hanya untuk yang belum login */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* RUTE CUSTOMER - hanya untuk customer yang sudah login */}
            <Route element={<ProtectedRoute requiredRole="customer" />}>
              <Route element={<CustomerLayout />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/address" element={<Address />} />
                {/* Route untuk Order System */}
                <Route path="/checkout" element={<Checkout />} />
                <Route
                  path="/order-success/:orderId"
                  element={<OrderSuccess />}
                />
                <Route path="/orders" element={<UserOrders />} />
              </Route>
            </Route>

            {/* RUTE ADMIN - hanya untuk admin yang sudah login */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              {/* Anda bisa menambahkan <AdminLayout> di sini jika perlu */}
              <Route path="/admin/dashboard" element={<AdminHome />} />
              <Route path="/admin/product" element={<AdminProduct />} />
              <Route
                path="/admin/testimonials"
                element={<AdminTestimonial />}
              />
              <Route path="/admin/customer" element={<CustomerPage />} />
              <Route path="/admin/order" element={<AdminOrders />} />
              <Route path="/admin/history" element={<HistoryPage />} />
            </Route>

            {/* Fallback jika halaman tidak ditemukan */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
