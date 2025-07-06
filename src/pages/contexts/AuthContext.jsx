import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getProfile } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...");
        
        // Cek session yang ada
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
        } else {
          console.log("📋 Initial session:", session ? "Found" : "None");
          
          if (session?.user && mounted) {
            setUser(session.user);
            console.log("👤 User set:", session.user.id);
            
            // Fetch profile
            try {
              const profileData = await getProfile(session.user.id);
              if (mounted) {
                setProfile(profileData);
                console.log("📝 Profile set:", profileData ? "Success" : "No data");
              }
            } catch (profileError) {
              console.error("❌ Profile fetch error:", profileError);
              if (mounted) setProfile(null);
            }
          } else if (mounted) {
            setUser(null);
            setProfile(null);
          }
        }

        // Setup auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state changed:', event);
            
            if (!mounted) return;
            
            if (session?.user) {
              setUser(session.user);
              
              // Fetch profile untuk event login
              if (event === 'SIGNED_IN') {
                try {
                  const profileData = await getProfile(session.user.id);
                  if (mounted) {
                    setProfile(profileData);
                  }
                } catch (profileError) {
                  console.error("❌ Profile error in auth change:", profileError);
                  if (mounted) setProfile(null);
                }
              }
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        );

        authSubscription = subscription;
        
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        // SELALU set loading false di akhir
        if (mounted) {
          setLoading(false);
          initialized.current = true;
          console.log("✅ Auth initialization complete");
        }
      }
    };

    // Cek apakah sudah pernah initialize
    if (!initialized.current) {
      initializeAuth();
    }

    // Cleanup function
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Dependency array kosong

  // Debug log yang lebih simple
  console.log('AuthContext state:', { 
    user: !!user, 
    profile: !!profile, 
    loading 
  });

  const value = {
    user,
    profile,
    loading
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontSize: '24px',
        flexDirection: 'column'
      }}>
        <div>Memuat Aplikasi...</div>
        <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
          Mohon tunggu sebentar...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}