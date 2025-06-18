// src/pages/AdminDashboard.jsx
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

const dummyData = [
  {
    name: "Jaket Jeans Levi's Vintage",
    image: "/images/jaket-jeans.png",
    size: "L",
    condition: "90% Like New",
    price: "150.000",
  },
  {
    name: "Celana Cargo Army",
    image: "/images/celana-cargo.png",
    size: "M",
    condition: "80% Mulus",
    price: "100.000",
  },
  {
    name: "Sepatu Vans Old Skool",
    image: "/images/vans.png",
    size: "42",
    condition: "85% Normal",
    price: "250.000",
  },
  {
    name: "Kemeja Flanel Uniqlo",
    image: "/images/item_20_kv.jpg",
    size: "L",
    condition: "95% Like New",
    price: "90.000",
  },
  {
    name: "Tas Ransel Eiger Bekas",
    image: "/images/item.jpg",
    size: "30L",
    condition: "80% Normal",
    price: "180.000",
  },
  {
    name: "Hoodie Champion Original",
    image: "/images/hoodie-champion.png",
    size: "XL",
    condition: "90% Bagus",
    price: "220.000",
  },
];


const AdminDashboard = () => {
    // Fungsi dummy untuk tambah produk
    const handleAdd = () => {
        alert("Fitur tambah produk belum diimplementasikan.");
    };

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-100 min-h-screen">
                <Topbar />

                {/* Konten scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold">Product</h1>
                    <p className="text-gray-500 mb-4">
                        Manage your product inventory, ensuring all listings are up-to-date and accurate
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        {/* Tombol Tambah Produk */}
                        <button
                            onClick={handleAdd}
                            className="bg-black text-black px-4 py-2 rounded hover:scale-105 transition-all duration-300"
                        >
                            + Tambah Produk
                        </button>

                        {/* Dropdown Sort & Search */}
                        <div className="flex gap-2 items-center">
                            {/* Dropdown Sort (warna hitam sejak awal) */}
                            <select
                                onChange={(e) => console.log("Sort by:", e.target.value)}
                                className="bg-black text-white border-none px-3 py-2 rounded-md"
                            >
                                <option value="default">Urutkan</option>
                                <option value="name-asc">Nama A-Z</option>
                                <option value="name-desc">Nama Z-A</option>
                                <option value="price-asc">Harga Rendah</option>
                                <option value="price-desc">Harga Tinggi</option>
                            </select>

                            {/* Search Input (warna hitam sejak awal) */}
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                className="bg-black text-white border-none px-3 py-2 rounded-md placeholder-gray-300"
                                onChange={(e) => console.log("Search:", e.target.value)}
                            />
                        </div>
                    </div>



                    {/* Daftar Produk */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dummyData.map((car, i) => (
                            <ProductCard key={i} car={car} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default AdminDashboard;
