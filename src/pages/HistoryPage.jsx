// src/pages/HistoryPage.jsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useState } from "react";

const dummyTransactions = [
  {
    id: "TRX001",
    customer: "Agus Ramadhan",
    product: "Sepatu Nike Air Jordan",
    amount: 2350000,
    date: "2025-06-18",
    status: "Sukses",
  },
  {
    id: "TRX002",
    customer: "Siti Nurhaliza",
    product: "Celana Cargo Supreme",
    amount: 120000,
    date: "2025-06-17",
    status: "Menunggu",
  },
  {
    id: "TRX003",
    customer: "Joko Prasetyo",
    product: "Kaos Vintage Metallica",
    amount: 90000,
    date: "2025-06-15",
    status: "Gagal",
  },
];

const HistoryPage = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredTransactions = dummyTransactions.filter((trx) => {
    const matchSearch =
      trx.customer.toLowerCase().includes(search.toLowerCase()) ||
      trx.product.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter ? trx.date === dateFilter : true;
    return matchSearch && matchDate;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.text("Riwayat Transaksi", 14, 10);

    const tableColumn = ["ID", "Pelanggan", "Produk", "Total", "Tanggal", "Status"];
    const tableRows = [];

    filteredTransactions.forEach((trx) => {
      const rowData = [
        trx.id,
        trx.customer,
        trx.product,
        `Rp ${trx.amount.toLocaleString("id-ID")}`,
        trx.date,
        trx.status,
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("riwayat-transaksi.pdf");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Topbar />
        <div className="p-6 overflow-auto flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
            <div className="flex gap-2">
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <input
                type="text"
                placeholder="Cari..."
                className="border rounded px-3 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={handleExportPDF}
                className="bg-black text-white px-4 py-2 rounded-md hover:scale-105 transition-all"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border border-gray-300 rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2">ID Transaksi</th>
                  <th className="px-4 py-2">Pelanggan</th>
                  <th className="px-4 py-2">Produk</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((trx, i) => (
                  <tr
                    key={i}
                    className="bg-white even:bg-gray-50 hover:bg-gray-100 transition-all"
                  >
                    <td className="px-4 py-2 font-medium">{trx.id}</td>
                    <td className="px-4 py-2">{trx.customer}</td>
                    <td className="px-4 py-2">{trx.product}</td>
                    <td className="px-4 py-2 font-semibold">
                      Rp {trx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2">{trx.date}</td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        trx.status === "Sukses"
                          ? "text-green-600"
                          : trx.status === "Menunggu"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {trx.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HistoryPage;
