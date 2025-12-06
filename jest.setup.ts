/* eslint-env jest */
// Jest setup file for Expo/React Native tests
import 'react-native-gesture-handler/jestSetup';
import { supabaseClient as mockSupabaseClient } from './db/__mocks__/supabaseClientMock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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

