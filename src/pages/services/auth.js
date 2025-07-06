import { supabase } from '../lib/supabase';

/**
 * Mendaftarkan pengguna baru.
 * Tugasnya HANYA mengirimkan data ke Supabase Auth.
 * Sisanya akan diurus oleh Database Trigger.
 */
export async function signUpUser(email, password, name, phone) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name,   // Kirim nama sebagai metadata
        phone: phone  // Kirim telepon sebagai metadata
      }
    }
  });

  if (error) throw error;
  return data;
}

// Fungsi signInUser tidak berubah
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) throw error;
  return data;
}

// Fungsi signOutUser tidak berubah
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Fungsi getProfile tidak berubah
export async function getProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select(`*`)
      .eq('id', userId)
      .single();

    if (error && status !== 406) {
      console.error("Supabase error in getProfile:", error);
      return null;
    }
    return data;
  } catch (e) {
    console.error("Critical error in getProfile:", e);
    return null;
  }
}

// Fungsi updateProfile tidak berubah
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  
  if (error) {
    console.error("Error updating profile:", error.message);
  }
  return data;
}
