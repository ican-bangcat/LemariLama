// src/pages/AdminHome.jsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

const AdminHome = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Topbar />

        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Dashboard LemariLama</h1>
          <p className="text-sm text-gray-500 mb-4">
            Selamat datang! Pantau aktivitas harian toko Anda di sini.
          </p>

          {/* Kartu Statistik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Reservasi Hari Ini" value="0" icon="📅" />
            <Card title="Pelanggan Baru Hari Ini" value="0" icon="👥" />
            <Card title="Pendapatan Hari Ini" value="$0" icon="💰" />
            <Card title="Pembelian Produk Hari Ini" value="0" icon="🛒" />
          </div>

          {/* Grafik Penjualan & Perkembangan Pelanggan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphCard title="Grafik Penjualan Produk">
              <img src="/images/penjualan.png" alt="Grafik Penjualan" />
            </GraphCard>
            <GraphCard title="Perkembangan Jumlah Pelanggan">
              <img src="/images/pelanggan.png" alt="Grafik Pelanggan" />
            </GraphCard>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-2">
    <div className="text-3xl">{icon}</div>
    <div className="text-gray-500 text-sm">{title}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

const GraphCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h3 className="text-md font-semibold mb-4">{title}</h3>
    <div className="h-60">{children}</div>
  </div>
);

export default AdminHome;
