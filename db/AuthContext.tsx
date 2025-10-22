import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabaseClient } from '@/db/supabaseClient';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

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
    // 1. Get the initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Listen for auth state changes (sign-in, sign-out)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Note: Deep link handling is now done directly in signInWithGoogle function
    // since the OAuth flow completes within WebBrowser.openAuthSessionAsync

    return () => {
      subscription.unsubscribe();
    };
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
      const redirectTo = makeRedirectUri(); // Creates a redirect URI like 'app.meritable://'

      if (Platform.OS === 'web') {
        // Web flow - let Supabase handle redirect
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          return { error };
        }
        if (data.url) window.location.href = data.url;
        return { error: null };
      } else {
        // Mobile flow - use the exact pattern from the guide
        // 1. Initiate the OAuth flow
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true, // This is key for mobile
          },
        });

        if (error) {
          return { error };
        }

        if (data.url) {
          // 2. Open the URL in a web browser
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

          // 3. The result contains the URL with session data in the fragment
          if (result.type === 'success' && result.url) {
            
            // Manually extract tokens from the URL fragment
            const url = new URL(result.url);
            const fragment = url.hash.substring(1); // Remove the # symbol
            const params = new URLSearchParams(fragment);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            
            if (accessToken && refreshToken) {
              
              const { error: sessionError } = await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                return { error: sessionError };
              }
              
            } else {
              return { error: { message: 'No tokens found in OAuth response' } };
            }
          } else if (result.type === 'cancel') {
            return { error: { message: 'Sign in cancelled' } };
          } else {
            return { error: { message: 'Sign in failed' } };
          }
        }

        return { error: null };
      }
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
