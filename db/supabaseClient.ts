import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error('Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  // Don't throw immediately, let the app handle this gracefully
}

// Create a localStorage adapter for web
const localStorageAdapter = typeof window !== 'undefined' ? {
  getItem: (key: string) => {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
} : undefined;

// Create a single, shared Supabase client instance
// On web, use localStorage for session persistence
// On native, use AsyncStorage for session persistence
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS === 'web' 
      ? {
          // Use localStorage on web for session persistence
          storage: localStorageAdapter,
          persistSession: true,
          // Enable URL detection for OAuth redirects on web
          detectSessionInUrl: true,
        }
      : {
          // Use AsyncStorage on native platforms
          storage: AsyncStorage,
          persistSession: true,
          // Disable URL detection on native (we handle it manually)
          detectSessionInUrl: false,
        }
    ),
    autoRefreshToken: true,
  },
})
