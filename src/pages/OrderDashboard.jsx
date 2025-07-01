import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";

const OrderDashboard = () => {
  const [orders, setOrders] = useState([
    {
      id: "#ORD-001",
      customer: "Agus Ramadhan",
      product: "Kaos Thrift Uniqlo",
      price: "Rp 75.000",
      date: "2025-06-18",
      status: "Dikirim",
    },
    {
      id: "#ORD-002",
      customer: "Siti Nurhaliza",
      product: "Celana Cargo Thrift",
      price: "Rp 120.000",
      date: "2025-06-17",
      status: "Diproses",
    },
    {
      id: "#ORD-003",
      customer: "Joko Prasetyo",
      product: "Kemeja Vintage",
      price: "Rp 90.000",
      date: "2025-06-16",
      status: "Selesai",
    },
  ]);

  const handleStatusChange = (index, newStatus) => {
    const updatedOrders = [...orders];
    updatedOrders[index].status = newStatus;
    setOrders(updatedOrders);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-60 fixed top-0 left-0 h-screen z-10 bg-white shadow-md">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col ml-60 bg-gray-100">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-2xl font-bold">Order LemariLama</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card color="purple" title="New Orders" value="35,673" desc="200% (30 days)" />
            <Card color="green" title="Total Income" value="$14,966" desc="Increased by 7.35%" />
            <Card color="blue" title="Total Expense" value="2,652" desc="Increased by 7.35%" />
            <Card color="yellow" title="New Users" value="32,566" desc="54% Increase" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card color="pink" title="Top Product" value="Nike Air Jordan" desc="Best selling item" />
            <Card color="indigo" title="Most Active User" value="Zidan Sabili" desc="12 orders" />
            <Card color="orange" title="Customer Feedback" value="87%" desc="Positive reviews" />
            <Card color="red" title="Pending Orders" value="58" desc="Waiting for confirmation" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md mt-6">
            <h2 className="text-xl font-semibold mb-4">Orderan Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Pelanggan</th>
                    <th className="px-4 py-2">Produk</th>
                    <th className="px-4 py-2">Harga</th>
                    <th className="px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{order.id}</td>
                      <td className="px-4 py-2">{order.customer}</td>
                      <td className="px-4 py-2">{order.product}</td>
                      <td className="px-4 py-2">{order.price}</td>
                      <td className="px-4 py-2">{order.date}</td>
                      <td className="px-4 py-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(index, e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                          <option value="Diproses">Diproses</option>
                          <option value="Dikirim">Dikirim</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

const Card = ({ color, title, value, desc }) => (
  <div className={`bg-${color}-100 p-6 rounded-xl shadow-md`}>
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-gray-500">{desc}</p>
  </div>
);

export default OrderDashboard;
