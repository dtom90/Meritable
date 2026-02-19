import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Determines if the app is currently running in TestFlight.
 *
 * Uses the `expo-testflight` package when the native module is available
 * (iOS dev/production builds). In Expo Go, web, or when the module is
 * unavailable, returns false so the app runs without crashing.
 *
 * @returns `true` if running in TestFlight, `false` otherwise
 *
 * @example
 * ```tsx
 * import { isTestFlight } from '@/lib/isTestFlight';
 *
 * if (isTestFlight()) {
 *   // Enable TestFlight-only features
 * }
 * ```
 */
export function isTestFlight(): boolean {
  if (Platform.OS !== 'ios') {
    return false;
  }
  // Expo Go does not include the expo-testflight native module; only require in standalone/bare builds
  if (Constants.executionEnvironment === 'storeClient') {
    return false;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional load; module only exists in iOS standalone/bare builds
    const { isTestFlight: expoIsTestFlight } = require('expo-testflight');
    return expoIsTestFlight;
  } catch {
    return false;
  }
}
