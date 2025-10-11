import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabaseClient } from '@/db/supabaseClient';
import { Platform, Linking } from 'react-native';
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
        console.log('onAuthStateChange event:', event, 'session:', session);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // 3. Handle incoming deep links
    const handleDeepLink = (event: { url: string }) => {
      console.log('handleDeepLink received URL:', event.url);
      const urlString = event.url;
      // Supabase sends tokens in the fragment, not query params
      const fragment = urlString.split('#')[1];

      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('Setting session from deep link...');
          supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }).catch(error => {
            console.error('Error setting session from deep link:', error);
          });
        }
      }
    };

    // Listen for deep links when the app is opened
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.unsubscribe();
      // Clean up the event listener
      linkingSubscription?.remove();
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
      const redirectTo = makeRedirectUri(); // Creates a redirect URI like 'exp://127.0.0.1:19000/--'

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
          console.error('Error signing in with Google:', error.message);
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
          console.error('Error signing in with Google:', error.message);
          return { error };
        }

        if (data.url) {
          // 2. Open the URL in a web browser
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

          // 3. The result contains the URL with session data in the fragment
          if (result.type === 'success') {
            // The session is automatically handled by the Supabase client
            // when the deep link is processed (see useEffect above)
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
