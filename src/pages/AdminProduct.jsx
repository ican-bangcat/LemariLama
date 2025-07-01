// src/pages/AdminProduct.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import ProductFormModal from "../components/ProductFormModal";


const AdminProduct = () => {
    const [products, setProducts] = useState([
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
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [showModal, setShowModal] = useState(false);

    const handleAdd = (product) => {
        setProducts([...products, product]);
        setShowModal(false);
    };

    const filteredProducts = products
        .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "name-asc") return a.name.localeCompare(b.name);
            if (sortBy === "name-desc") return b.name.localeCompare(a.name);
            if (sortBy === "price-asc") return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""));
            if (sortBy === "price-desc") return parseInt(b.price.replace(/\D/g, "")) - parseInt(a.price.replace(/\D/g, ""));
            return 0;
        });

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-gray-100 min-h-screen relative">
                <Topbar />

                {/* Blur overlay if modal active */}
                {showModal && (
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-md backdrop-brightness-90 z-10"></div>
                )}


                <div className="flex-1 overflow-y-auto p-6 relative z-0">
                    <h1 className="text-2xl font-bold">Product</h1>
                    <p className="text-gray-500 mb-4">
                        Manage your product inventory, ensuring all listings are up-to-date and accurate
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-black text-white px-4 py-2 rounded hover:scale-105 transition-all duration-300"
                        >
                            + Tambah Produk
                        </button>
                        


                        <div className="flex gap-2 items-center">
                            <select
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-black text-white border-none px-3 py-2 rounded-md"
                            >
                                <option value="default">Urutkan</option>
                                <option value="name-asc">Nama A-Z</option>
                                <option value="name-desc">Nama Z-A</option>
                                <option value="price-asc">Harga Rendah</option>
                                <option value="price-desc">Harga Tinggi</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Cari produk..."
                                className="bg-black text-white border-none px-3 py-2 rounded-md placeholder-gray-300"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((car, i) => (
                            <ProductCard key={i} car={car} />
                        ))}
                    </div>
                </div>

                <Footer />

                {/* Modal untuk tambah produk */}
                {showModal && <ProductFormModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
            </div>
        </div>
    );
};

export default AdminProduct;
