import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabaseClient } from '@/db/supabaseClient';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('onAuthStateChange event:', event, 'session:', session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = Platform.OS === 'web' 
        ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`
        : 'app.meritable://auth/callback';

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { error };
      }
      
      if (!data.url) {
        return { error: { message: 'Failed to get auth URL' } };
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === 'success') {
        // The onAuthStateChange listener doesn't automatically trigger on mobile,
        // so we need to manually pass the session tokens to Supabase.
        const url = result.url;
        
        // Extract tokens from the URL hash
        const hash = url.split('#')[1];
        if (!hash) {
          console.error("No tokens found in the redirect URL");
          return { error: { message: "Authentication failed: Invalid redirect" } };
        }
        
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) {
          console.error("Incomplete tokens in the redirect URL");
          return { error: { message: "Authentication failed: Incomplete tokens" } };
        }

        // Manually set the session for the Supabase client
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          return { error: sessionError };
        }

        // --- Manually update the auth state ---
        if (sessionData.session && sessionData.user) {
          setSession(sessionData.session);
          setUser(sessionData.user);
        }
        // ------------------------------------

      } else if (result.type !== 'cancel' && result.type !== 'dismiss') {
        // Log errors if the auth session failed for reasons other than user cancellation
        console.warn('Auth session failed:', result);
      }
      return { error: null };
    } catch (error) {
      console.error('Caught an exception in signInWithGoogle:', error);
      return { error: { message: 'Failed to sign in with Google' } };
    }
  };

  const signOut = async () => {
    console.log('signOut called');
    const { error } = await supabaseClient.auth.signOut();
    console.log('signOut error', error);
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
