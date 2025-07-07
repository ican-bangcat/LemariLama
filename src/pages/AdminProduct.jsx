import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react";

// Import komponen UI Admin
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import ProductFormModal from "../components/ProductFormModal";

// Import fungsi dari service
import { getProducts, addProduct, deleteProduct } from "../pages/services/product";
import { useAuth } from "../pages/contexts/AuthContext";

const AdminProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    const { user } = useAuth();

    // Mengambil data saat komponen dimuat
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await getProducts();
                setProducts(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Fungsi untuk menambah produk
    const handleAdd = async (newProductData) => {
        try {
            const productWithOwner = { ...newProductData, admin_id: user.id };
            const addedProduct = await addProduct(productWithOwner);
            if (addedProduct) {
                // Refresh data untuk mendapatkan nama kategori
                const updatedProducts = await getProducts();
                setProducts(updatedProducts);
            }
            setShowModal(false);
        } catch (err) {
            console.error("Failed to add product:", err);
        }
    };

    // Fungsi untuk menghapus produk
    const handleDelete = async (productId) => {
        // PENTING: Di aplikasi nyata, tambahkan modal konfirmasi di sini!
        // if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
        
        try {
            const success = await deleteProduct(productId);
            if (success) {
                setProducts(products.filter(p => p.id !== productId));
            }
        } catch (err) {
            console.error("Failed to delete product:", err);
        }
    };

    // Logika untuk checkbox
    const handleSelectProduct = (productId) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(productId)) {
            newSelection.delete(productId);
        } else {
            newSelection.add(productId);
        }
        setSelectedProducts(newSelection);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        } else {
            setSelectedProducts(new Set());
        }
    };

    // Logika filter produk
    const filteredProducts = useMemo(() => 
        products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Header Halaman */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
                            <p className="text-gray-500 mt-1">Kelola semua produk Anda di sini.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Plus size={18} />
                            Tambah Produk
                        </button>
                    </div>

                    {/* Kontrol Tabel */}
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama produk..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Tabel Produk */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0} /></th>
                                    <th className="p-4">Produk</th>
                                    <th className="p-4">Stok</th>
                                    <th className="p-4">Harga</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Kategori</th>
                                    <th className="p-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="7" className="text-center p-8">Loading...</td></tr>}
                                {error && <tr><td colSpan="7" className="text-center p-8 text-red-500">Error: {error}</td></tr>}
                                {!loading && !error && filteredProducts.map(product => (
                                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-4"><input type="checkbox" checked={selectedProducts.has(product.id)} onChange={() => handleSelectProduct(product.id)} /></td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <img src={product.images?.[0] || 'https://placehold.co/40x40/E2E8F0/4A5568?text=N/A'} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                                <span className="font-medium text-gray-800">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{product.stock}</td>
                                        <td className="p-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${product.is_sold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {product.is_sold ? 'Terjual' : 'Tersedia'}
                                            </span>
                                        </td>
                                        <td className="p-4">{product.categories?.name || 'N/A'}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-gray-200 rounded-full"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-100 rounded-full text-red-600"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
                <Footer />
                {showModal && <ProductFormModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
            </div>
        </div>
    );
};

export default AdminProduct;
