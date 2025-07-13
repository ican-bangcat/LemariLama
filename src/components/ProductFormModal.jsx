import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import { getCategories, uploadImage, addProduct, updateProduct } from "../pages/services/product";
import { useAuth } from "../pages/contexts/AuthContext";

const ProductFormModal = ({ onClose, onSave, productToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        condition: '100%',
        category_id: '',
        size: '',
        images: [],
    });
    
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const isEditMode = Boolean(productToEdit);

    // Load categories and set form data for edit mode
    useEffect(() => {
        const fetchAndSetData = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats || []);
                
                // Set default category if not in edit mode
                if (cats?.length > 0 && !productToEdit) {
                    setFormData(prev => ({ ...prev, category_id: cats[0].id }));
                }
            } catch (err) {
                console.error("Error loading categories:", err);
                setError("Gagal memuat kategori.");
            }
        };

        fetchAndSetData();

        // Set form data for edit mode
        if (isEditMode && productToEdit) {
            setFormData({
                name: productToEdit.name || '',
                description: productToEdit.description || '',
                price: productToEdit.price || '',
                stock: productToEdit.stock || '',
                condition: productToEdit.condition || '100%',
                category_id: productToEdit.category_id || '',
                size: productToEdit.size || '',
                images: productToEdit.images || [],
            });
            setImagePreviews(productToEdit.images || []);
        }
    }, [productToEdit, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        if (type === 'number') {
            setFormData(prev => ({
                ...prev,
                [name]: value === '' ? '' : Number(value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Add new files to imageFiles array
        setImageFiles(prev => [...prev, ...files]);

        // Create previews for new files
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        const imageToRemove = imagePreviews[index];
        
        // Check if it's an existing URL or a new file
        if (typeof imageToRemove === 'string' && imageToRemove.startsWith('http')) {
            // It's an existing URL, remove from formData.images
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter(url => url !== imageToRemove)
            }));
        } else {
            // It's a new file, find its index in imageFiles
            const existingImagesCount = formData.images.length;
            const fileIndex = index - existingImagesCount;
            
            if (fileIndex >= 0) {
                setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
            }
        }

        // Remove from previews
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error("Nama produk wajib diisi");
            }
            if (!formData.category_id) {
                throw new Error("Kategori wajib dipilih");
            }
            if (!formData.price || Number(formData.price) <= 0) {
                throw new Error("Harga harus lebih dari 0");
            }
            if (formData.stock === '' || Number(formData.stock) < 0) {
                throw new Error("Stok tidak boleh kosong atau negatif");
            }

            // Debug: Log user info
            console.log("Current user:", user);
            console.log("User ID:", user?.id);

            let imageUrls = [...formData.images]; // Keep existing images

            // Upload new images if any
            if (imageFiles.length > 0) {
                console.log("Uploading", imageFiles.length, "new images...");
                const uploadPromises = imageFiles.map(file => uploadImage(file));
                const newImageUrls = await Promise.all(uploadPromises);
                imageUrls = [...imageUrls, ...newImageUrls];
            }

            // Prepare product data
            const productData = {
                ...formData,
                images: imageUrls,
                price: Number(formData.price),
                stock: Number(formData.stock),
            };

            // Add admin_id for new products
            if (!isEditMode) {
                productData.admin_id = user.id;
            }

            console.log("Sending product data:", productData);

            let result;
            if (isEditMode) {
                result = await updateProduct(productToEdit.id, productData);
            } else {
                result = await addProduct(productData);
            }

            console.log("Product saved successfully:", result);
            
            // Call onSave callback if provided
            if (onSave) {
                onSave(result);
            }
            
            onClose();
        } catch (error) {
            console.error("Error saving product:", error);
            setError(error.message || "Gagal menyimpan produk. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Produk *
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    id="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Deskripsi
                                </label>
                                <textarea 
                                    name="description" 
                                    id="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows="4" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategori *
                                </label>
                                <select 
                                    name="category_id" 
                                    id="category_id" 
                                    value={formData.category_id} 
                                    onChange={handleChange} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Harga (Rp) *
                                    </label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        id="price" 
                                        value={formData.price} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        required 
                                        min="1"
                                        placeholder="Masukkan harga"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                                        Stok *
                                    </label>
                                    <input 
                                        type="number" 
                                        name="stock" 
                                        id="stock" 
                                        value={formData.stock} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        required 
                                        min="0"
                                        placeholder="Masukkan stok"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                                        Kondisi *
                                    </label>
                                    <select 
                                        name="condition" 
                                        id="condition" 
                                        value={formData.condition} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        required
                                    >
                                        <option value="100%">100% (Seperti Baru)</option>
                                        <option value="90%">90% (Baik)</option>
                                        <option value="75%">75% (Cukup)</option>
                                        <option value="50%">50% (Layak Pakai)</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ukuran
                                    </label>
                                    <input 
                                        type="text" 
                                        name="size" 
                                        id="size" 
                                        value={formData.size} 
                                        onChange={handleChange} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gambar Produk
                        </label>
                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                            <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
                                        <span>Upload file</span>
                                        <input 
                                            id="image-upload" 
                                            name="image-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            multiple 
                                            onChange={handleImageChange} 
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp" 
                                        />
                                    </label>
                                    <p className="pl-1">atau tarik dan lepas</p>
                                </div>
                                <p className="text-xs text-gray-500">JPEG, PNG, GIF, WebP, SVG, BMP hingga 10MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img 
                                            src={preview} 
                                            alt={`Preview ${index + 1}`} 
                                            className="h-24 w-24 object-cover rounded-lg shadow-md" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => removeImage(index)} 
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}
                </form>

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;