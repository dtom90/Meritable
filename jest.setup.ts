/* eslint-env jest */
// Jest setup file for Expo/React Native tests
import 'react-native-gesture-handler/jestSetup';
import { supabaseClient as mockSupabaseClient } from './db/__mocks__/supabaseClientMock';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock NativeWind CSS Interop - className prop requires runtime processing
// Standard practice: Mock react-native-css-interop to allow className prop without processing
jest.mock('react-native-css-interop', () => ({
  styled: (component: any) => component,
  cssInterop: (component: any) => component,
  __esModule: true,
  default: {
    styled: (component: any) => component,
    cssInterop: (component: any) => component,
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Expo modules (used across multiple tests)
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'app.meritable://'),
}));

// Mock Supabase client (used across multiple tests)
jest.mock('./db/supabaseClient', () => ({
  supabaseClient: mockSupabaseClient,
}));

