import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Determines if the app is currently running in TestFlight.
 * 
 * TestFlight detection works by checking the execution environment.
 * When an app is distributed via TestFlight, Expo Constants sets
 * `executionEnvironment` to `ExecutionEnvironment.StoreClient`.
 * 
 * This is a secure check because:
 * - TestFlight requires device registration with Apple
 * - The execution environment is set by the runtime, not the app
 * - Cannot be spoofed by client-side code
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
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}
