import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile } from '../services/auth'; // Import fungsi getProfile

// Buat Context
const AuthContext = createContext();

// Buat Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek sesi yang sedang berjalan
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await getProfile(session.user.id);
        setProfile(profileData);
      }
      setLoading(false);
    };

    getSession();

    // Dengarkan perubahan status otentikasi
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const profileData = await getProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Cleanup listener saat komponen unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    // Anda bisa menambahkan fungsi signIn, signOut dari service ke sini jika mau
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Buat custom hook untuk menggunakan context
export function useAuth() {
  return useContext(AuthContext);
}