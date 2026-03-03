import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Returns true when the app is in an environment where cloud auth (or similar
 * “pre-release” features) should be shown: Expo Go / dev client (StoreClient)
 * or iOS TestFlight.
 *
 * - StoreClient: Expo Go or a development build with expo-dev-client
 * - TestFlight: iOS standalone build distributed via TestFlight (expo-testflight)
 *
 * @returns `true` if running in Expo Go, dev client, or TestFlight; `false` otherwise
 */
export function isTestFlightOrExpoGo(): boolean {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return true;
  }
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- conditional load; module only exists in iOS standalone/bare builds
    const { isTestFlight } = require('expo-testflight');
    return isTestFlight;
  } catch {
    return false;
  }
}
