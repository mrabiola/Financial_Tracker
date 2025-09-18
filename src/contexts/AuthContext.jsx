import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { cleanupDemoSession, isDemoSession, getDemoSessionId } from '../utils/demoSession';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);

      // Clean up any lingering demo session when a real user logs in
      if (session?.user && isDemoSession()) {
        const demoSessionId = getDemoSessionId();
        if (demoSessionId) {
          cleanupDemoSession(demoSessionId).then(() => {
            console.log('Cleaned up demo session after real user login');
          });
        }
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      // Clean up demo session when a real user logs in
      if (_event === 'SIGNED_IN' && session?.user && isDemoSession()) {
        const demoSessionId = getDemoSessionId();
        if (demoSessionId) {
          cleanupDemoSession(demoSessionId).then(() => {
            console.log('Cleaned up demo session after real user sign in');
          });
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clean up demo session if it exists
      if (isDemoSession()) {
        const demoSessionId = getDemoSessionId();
        if (demoSessionId) {
          await cleanupDemoSession(demoSessionId);
          console.log('Demo session cleaned up during sign out');
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user data
      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...updates
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};