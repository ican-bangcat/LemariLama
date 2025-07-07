// components/ProductFormModal.jsx
import { useState, useEffect } from "react";
import { getCategories } from "../pages/services/product"; // Sesuaikan path

const ProductFormModal = ({ onClose, onSave, productToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        condition: '',
        category_id: '', // Initial state empty
        size: '',
        images: [],
    });
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchCategoriesError, setFetchCategoriesError] = useState(null); // State baru untuk error kategori

    const isEditMode = Boolean(productToEdit);

    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats || []);
                setFetchCategoriesError(null); // Reset error jika berhasil

                // Jika mode tambah DAN kategori tersedia, set kategori pertama sebagai default
                if (cats && cats.length > 0 && !isEditMode) {
                    setFormData(prev => ({ ...prev, category_id: cats[0].id }));
                } else if (isEditMode) {
                    // Jika mode edit, pastikan category_id produk yang diedit sudah terset
                    // Ini juga menangani jika productToEdit.category_id tidak ada atau null
                    setFormData(prev => ({ ...prev, category_id: productToEdit.category_id || (cats && cats.length > 0 ? cats[0].id : '') }));
                }
            } catch (err) {
                console.error("Gagal memuat kategori:", err);
                setFetchCategoriesError("Gagal memuat kategori. Pastikan ada kategori di sistem.");
                setCategories([]); // Pastikan state kategori kosong jika ada error
            }
        };
        fetchCategoriesData();

        // Jika ini adalah mode edit, isi form dengan data produk
        if (isEditMode) {
            setFormData({
                name: productToEdit.name,
                description: productToEdit.description,
                price: productToEdit.price,
                stock: productToEdit.stock,
                condition: productToEdit.condition || '',
                category_id: productToEdit.category_id, // Akan di-override/set oleh fetchCategoriesData
                size: productToEdit.size || '',
                images: productToEdit.images || [],
            });
        }
    }, [productToEdit, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi tambahan sebelum submit
        if (categories.length === 0) {
            alert('Tidak ada kategori tersedia. Harap tambahkan kategori terlebih dahulu.');
            return;
        }
        if (formData.category_id === '') {
            alert('Harap pilih kategori produk.');
            return;
        }
        if (!formData.name.trim()) {
            alert('Nama produk tidak boleh kosong.');
            return;
        }
        if (formData.price <= 0) {
            alert('Harga harus lebih besar dari nol.');
            return;
        }
        if (formData.stock < 0) {
            alert('Stok tidak boleh kurang dari nol.');
            return;
        }
        // Tambahkan validasi lain sesuai kebutuhan (misal: deskripsi, kondisi)

        setIsLoading(true);
        try {
            await onSave(formData, productToEdit?.id);
            onClose(); // Tutup modal setelah berhasil
        } catch (error) {
            console.error("Gagal menyimpan produk:", error);
            alert("Gagal menyimpan produk. Silakan coba lagi. " + (error.message || '')); // Tampilkan pesan error spesifik jika ada
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Latar belakang blur dan sedikit transparan
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
            {/* Animasi pop-up pada div modal utama */}
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-95 opacity-100 animate-modal-open">
                <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nama Produk */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>

                        {/* Kategori */}
                        <div>
                            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Kategori</label>
                            {/* Menampilkan pesan error atau loading kategori */}
                            {fetchCategoriesError && <p className="text-red-500 text-sm mb-2">{fetchCategoriesError}</p>}
                            {categories.length === 0 && !fetchCategoriesError && (
                                <p className="text-gray-500 text-sm mb-2">Memuat kategori atau tidak ada kategori tersedia...</p>
                            )}
                            <select
                                name="category_id"
                                id="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                required
                                disabled={categories.length === 0 && !fetchCategoriesError} // Nonaktifkan jika tidak ada kategori
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>

                        {/* Harga */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Harga</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" required min="0" />
                        </div>

                        {/* Stok */}
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stok</label>
                            <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" required min="0" />
                        </div>

                        {/* Kondisi */}
                        <div>
                            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Kondisi</label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className="mt-1 w-full border-gray-300 rounded-md shadow-sm"
                                required
                            >
                                <option value="">-- Pilih Kondisi --</option>
                                <option value="100%">100%</option>
                                <option value="90%">90%</option>
                                <option value="75%">75%</option>
                                <option value="50%">50%</option>
                            </select>
                        </div>



                        {/* Ukuran */}
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700">Ukuran (opsional)</label>
                            <input type="text" name="size" id="size" value={formData.size} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" />
                        </div>

                        {/* Deskripsi */}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="4" className="mt-1 w-full border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (categories.length === 0 && !fetchCategoriesError)} // Nonaktifkan jika loading atau tidak ada kategori
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;