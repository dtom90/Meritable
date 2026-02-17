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
  try {
    // Lazy require so missing native module (Expo Go, web) fails at call time, not import time
    const { isTestFlight: expoIsTestFlight } = require('expo-testflight');
    return expoIsTestFlight;
  } catch {
    return false;
  }
}
