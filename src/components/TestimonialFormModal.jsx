import { useEffect, useState } from "react";
import { X } from "lucide-react";

const TestimonialFormModal = ({ onClose, onSave, testimonialToEdit }) => {
    const [formData, setFormData] = useState({
        name: "",
        text: "",
        rating: 5,
    });

    useEffect(() => {
        if (testimonialToEdit) {
            setFormData({
                name: testimonialToEdit.name,
                text: testimonialToEdit.text,
                rating: testimonialToEdit.rating,
            });
        }
    }, [testimonialToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "rating" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.text.trim()) {
            alert("Nama dan testimoni wajib diisi!");
            return;
        }

        if (formData.rating < 1 || formData.rating > 5) {
            alert("Rating harus antara 1 - 5");
            return;
        }

        onSave(formData, testimonialToEdit?.id);
    };
    ;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4">{testimonialToEdit ? "Edit" : "Tambah"} Testimoni</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nama</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Testimoni</label>
                        <textarea name="text" value={formData.text} onChange={handleChange} required className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Rating</label>
                        <input type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} required className="w-full p-2 border rounded" />
                    </div>
                    <div className="text-right">
                        <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestimonialFormModal;
