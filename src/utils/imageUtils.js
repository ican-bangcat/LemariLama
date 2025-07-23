/**
 * Fungsi ini mengambil array URL gambar dari Supabase dan mengembalikan
 * URL gambar pertama yang valid. Jika tidak ada, ia mengembalikan placeholder.
 * @param {string[] | null} images - Array URL gambar dari kolom 'images' di Supabase.
 * @returns {string} URL gambar utama yang valid atau URL placeholder.
 */
export function getProductMainImage(images) {
  // Cek 1: Pastikan 'images' adalah sebuah array dan tidak kosong.
  if (Array.isArray(images) && images.length > 0) {
    // Cek 2: Pastikan elemen pertama adalah string yang valid (bukan null atau undefined).
    if (typeof images[0] === 'string' && images[0]) {
      return images[0]; // Kembalikan URL gambar pertama
    }
  }
  
  // Jika salah satu cek di atas gagal, kembalikan URL placeholder yang aman.
  return 'https://placehold.co/400x500/E2E8F0/4A5568?text=No+Image';
}

/**
 * Fungsi ini bisa Anda gunakan nanti untuk mem-parsing semua gambar
 * jika Anda ingin membuat galeri atau carousel.
 * @param {string[] | null} images - Array URL gambar.
 * @returns {string[]} Array URL gambar yang valid.
 */
export function parseProductImages(images) {
  if (Array.isArray(images)) {
    return images.filter(url => typeof url === 'string' && url);
  }
  return [];
}
