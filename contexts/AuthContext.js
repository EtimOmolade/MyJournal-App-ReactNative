import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase"

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check
    const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
        setLoading(false);
    };
    checkSession();
    
    // 2. Listener for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // UPDATED: signUp function to accept and save displayName AND gender
  const signUp = async (email, password, displayName, gender) => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { // Use the options object to pass metadata
            data: {
                display_name: displayName, // Store the name
                gender: gender,          // Store the new gender field
            },
        },
    });
    if (error) throw error;
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);