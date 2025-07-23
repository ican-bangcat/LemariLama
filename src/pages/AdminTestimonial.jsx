// src/pages/AdminTestimonial.jsx

import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import TestimonialFormModal from "../components/TestimonialFormModal";
import {
    getTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
} from "../pages/services/testimonial";

const AdminTestimonial = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [testimonialToEdit, setTestimonialToEdit] = useState(null);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const data = await getTestimonials();
            setTestimonials(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus testimonial ini?")) {
            try {
                await deleteTestimonial(id);
                fetchTestimonials();
            } catch (err) {
                alert("Gagal menghapus testimonial.");
            }
        }
    };

    const handleSaveTestimonial = async (data, id) => {
        try {
            console.log(">> MODE:", id ? "EDIT" : "TAMBAH");
            console.log(">> Data dikirim:", data);
            console.log(">> ID:", id);

            if (id) {
                await updateTestimonial(id, data);
            } else {
                await addTestimonial(data);
            }

            fetchTestimonials();
            setShowModal(false);
            setTestimonialToEdit(null);
        } catch (err) {
            console.error("Gagal menyimpan testimoni:", err.message);
            alert("Gagal menyimpan testimoni.");
        }
    };




    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Testimoni Pelanggan</h1>
                            <p className="text-gray-500">Lihat dan kelola testimoni yang masuk dari pengguna.</p>
                        </div>
                        <button
                            onClick={() => {
                                setTestimonialToEdit(null);
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Plus size={18} />
                            Tambah Testimoni
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4">Nama</th>
                                    <th className="p-4">Testimoni</th>
                                    <th className="p-4">Rating</th>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8">Loading...</td>
                                    </tr>
                                )}
                                {error && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8 text-red-500">Error: {error}</td>
                                    </tr>
                                )}
                                {!loading && testimonials.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center p-8">Belum ada testimoni.</td>
                                    </tr>
                                )}
                                {!loading &&
                                    testimonials.map((t) => (
                                        <tr key={t.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4 font-medium">{t.name}</td>
                                            <td className="p-4">{t.text}</td>
                                            <td className="p-4">{t.rating} / 5</td>
                                            <td className="p-4">{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                                            <td className="p-4 flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setTestimonialToEdit(t);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="p-2 hover:bg-red-100 rounded-full text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </main>
                <Footer />
                {showModal && (
                    <TestimonialFormModal
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveTestimonial}
                        testimonialToEdit={testimonialToEdit}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminTestimonial;
