import { supabase } from '../lib/supabase';

export async function signUpUser(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: { data: { name: name } }
  });
  if (error) throw error;
  return data;
}

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// PERBAIKAN UTAMA: Tambahkan caching dan error handling yang lebih baik
const profileCache = new Map();

export async function getProfile(userId, forceRefresh = false) {
  if (!userId) {
    console.warn("⚠️ getProfile called without userId");
    return null;
  }

  // Cek cache terlebih dahulu (kecuali force refresh)
  const cacheKey = `profile_${userId}`;
  if (!forceRefresh && profileCache.has(cacheKey)) {
    console.log("💾 Returning cached profile for user:", userId);
    return profileCache.get(cacheKey);
  }

  try {
    console.log("🔍 Fetching profile from database for user:", userId);
    
    const { data, error, status } = await supabase
      .from('profiles')
      .select(`*`)
      .eq('id', userId)
      .single();

    console.log("📊 Profile query result:", { data, error, status });

    if (error) {
      console.error("❌ Supabase error in getProfile:", error);
      
      // Jika error 406 (tidak ada data), bisa jadi user baru
      if (status === 406) {
        console.log("ℹ️ No profile found for user, might be new user");
        return null;
      }
      
      // Untuk error lainnya, jangan throw error, return null saja
      console.log("⚠️ Returning null due to error");
      return null;
    }

    // Simpan ke cache
    profileCache.set(cacheKey, data);
    console.log("✅ Profile cached successfully for user:", userId, "Data:", data);
    
    return data;

  } catch (e) {
    console.error("💥 Critical error in getProfile:", e);
    // Jangan throw error, return null untuk mencegah app crash
    return null;
  }
}

// Helper function untuk clear cache
export function clearProfileCache(userId = null) {
  if (userId) {
    profileCache.delete(`profile_${userId}`);
  } else {
    profileCache.clear();
  }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  
  if (error) {
    console.error("Error updating profile:", error.message);
    return null;
  }
  
  // Update cache dengan data terbaru
  if (data && data.length > 0) {
    profileCache.set(`profile_${userId}`, data[0]);
  }
  
  return data;
}