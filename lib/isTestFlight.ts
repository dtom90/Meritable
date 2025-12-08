import { isTestFlight as expoIsTestFlight } from 'expo-testflight';

/**
 * Determines if the app is currently running in TestFlight.
 * 
 * Uses the `expo-testflight` package which checks the app's receipt URL
 * to reliably detect TestFlight environments. This is the standard approach
 * for Expo apps and avoids the memory issues that can occur with manual
 * Constants-based detection.
 * 
 * The package automatically handles:
 * - iOS platform detection (returns false on non-iOS)
 * - Native receipt URL checking (sandboxReceipt indicates TestFlight)
 * - Safe error handling
 * 
 * @returns `true` if running in TestFlight, `false` otherwise
 * 
 * @example
 * ```tsx
 * import { isTestFlight } from '@/lib/useIsRegisteredTestDevice';
 * 
 * if (isTestFlight()) {
 *   // Enable TestFlight-only features
 * }
 * ```
 */
export function isTestFlight(): boolean {
  try {
    // expo-testflight already handles iOS check internally
    // It returns false on non-iOS platforms
    return expoIsTestFlight;
  } catch (error) {
    // Fail safe - return false on any error
    // eslint-disable-next-line no-console
    console.error('isTestFlight error:', error);
    return false;
  }
}
