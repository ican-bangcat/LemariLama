import { supabase } from '../lib/supabase';

// Fungsi untuk registrasi
// Perhatikan, kita menambahkan 'name' di dalam 'data' agar bisa diambil oleh trigger
export async function signUpUser(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name, // Data ini akan diteruskan ke trigger
      }
    }
  });

  if (error) throw error;
  return data;
}

// Fungsi untuk login
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) throw error;
  return data;
}

// Fungsi untuk logout
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Fungsi untuk mendapatkan data profil dari tabel 'profiles'
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single(); // .single() untuk mengambil satu objek, bukan array

  if (error) throw error;
  return data;
}

// Fungsi untuk update profil
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) throw error;
  return data;
}