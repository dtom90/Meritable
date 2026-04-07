import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

export default function Index() {
  // On web, check for OAuth error parameters before redirecting
  // This check happens synchronously during render to prevent redirect to /habits
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const hashParams = hash ? new URLSearchParams(hash.substring(1)) : new URLSearchParams();
    
    const error = searchParams.get('error') || hashParams.get('error');
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
    const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
    
    if (error) {
      // Redirect to /data with error parameters preserved in URL
      const errorParams = new URLSearchParams();
      if (error) errorParams.set('error', error);
      if (errorCode) errorParams.set('error_code', errorCode);
      if (errorDescription) errorParams.set('error_description', errorDescription);
      const errorQuery = errorParams.toString();
      // Use window.location.href to force navigation before React Router processes
      window.location.href = `/data?${errorQuery}`;
      // Return null to prevent rendering Redirect component
      return null;
    }
  }

  return <Redirect href="/habits" />;
}
