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

// Create a single, shared Supabase client instance
// On web, disable storage (no session persistence)
// On native, use AsyncStorage for session persistence
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS === 'web' 
      ? {
          // Disable storage on web
          storage: undefined,
          persistSession: false,
        }
      : {
          // Use AsyncStorage on native platforms
          storage: AsyncStorage,
          persistSession: true,
        }
    ),
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
