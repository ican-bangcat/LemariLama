// src/components/ProductFormModal.jsx
import { useState } from "react";

const ProductFormModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: "",
        image: "",
        size: "",
        condition: "",
        price: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: "", image: "", size: "", condition: "", price: "" });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg z-50">
                <h2 className="text-xl font-bold mb-4">Tambah Produk</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        name="name"
                        placeholder="Nama Produk"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                    <input
                        type="text"
                        name="image"
                        placeholder="URL Gambar"
                        value={formData.image}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                    <input
                        type="text"
                        name="size"
                        placeholder="Ukuran"
                        value={formData.size}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="text"
                        name="condition"
                        placeholder="Kondisi"
                        value={formData.condition}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    <input
                        type="text"
                        name="price"
                        placeholder="Harga"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                    <div className="flex justify-between mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-black text-white rounded hover:opacity-80"
                        >
                            Tambah
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
