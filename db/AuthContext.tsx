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

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
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
        // Web flow - use proper redirect URL
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: false, // Let Supabase handle the redirect
          },
        });

        if (error) {
          return { error };
        }
        return { error: null };
      } else {
        // Mobile flow - use PKCE flow for better security
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true, // This enables PKCE flow automatically
          },
        });

        if (error) {
          return { error };
        }

        if (data.url) {
          // Open the URL in a web browser
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

          // Handle the result
          if (result.type === 'success' && result.url) {
            // Extract the authorization code from the URL
            const url = new URL(result.url);
            const code = url.searchParams.get('code');
            
            if (code) {
              // Exchange the code for a session
              const { data: sessionData, error: sessionError } = await supabaseClient.auth.exchangeCodeForSession(code);
              
              setUser(sessionData?.user ?? null);
              setSession(sessionData.session ?? null);
              setIsLoading(false);
              
              if (sessionError) {
                return { error: sessionError };
              }
              
              return { error: null };
            } else {
              return { error: { message: 'No authorization code found in OAuth response' } };
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
      // eslint-disable-next-line no-console
      console.error('Caught an exception in signInWithGoogle:', error);
      return { error: { message: 'Failed to sign in with Google' } };
    }
  };

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut();
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
