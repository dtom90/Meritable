import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useAuth } from '@/db/AuthContext';
import LoginOverlay from '@/components/LoginOverlay';
import OAuthErrorModal from '@/components/OAuthErrorModal';
import SignOutAlertModal from '@/components/SignOutAlertModal';

export default function CloudAuthSection() {
  const { isAuthenticated, user, signOut } = useAuth();
  const [showSignOutAlert, setShowSignOutAlert] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Check for OAuth errors on mount (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Small delay to ensure page is fully loaded before showing alert
      const checkForError = () => {
        let errorMessage: string | null = null;
        
        // Check URL params for OAuth errors
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        const hashParams = hash ? new URLSearchParams(hash.substring(1)) : new URLSearchParams();
        
        const error = searchParams.get('error') || hashParams.get('error');
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
        
        if (error) {
          if (errorDescription) {
            // Decode and clean the error description
            let decoded = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
            // Remove any trailing query parameters (e.g., "?error=access_denied")
            errorMessage = decoded.split('?')[0].split('&')[0].trim();
          } else if (errorCode) {
            errorMessage = `${error}: ${errorCode}`;
          } else {
            errorMessage = 'Authentication failed. Please try again.';
          }
          // Clear error params from URL
          window.history.replaceState(null, '', '/data');
        }

        // Show error modal if error found
        if (errorMessage) {
          // Use setTimeout to ensure modal shows after render
          setTimeout(() => {
            setOauthError(errorMessage);
          }, 100);
        }
      };

      // Check immediately and also after a short delay to catch any race conditions
      checkForError();
      setTimeout(checkForError, 200);
    }
  }, []);

  const handleCloseOAuthError = () => {
    setOauthError(null);
  };

  const handleLoginSuccess = () => {
    setShowLoginOverlay(false);
  };

  const handleCloseLogin = () => {
    setShowLoginOverlay(false);
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      // Use custom modal for web
      setShowSignOutAlert(true);
    } else {
      // Use native Alert for mobile
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              const { error } = await signOut();
              if (error) {
                Alert.alert('Error', error.message);
              }
            },
          },
        ]
      );
    }
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowSignOutAlert(false);
  };

  const cancelSignOut = () => {
    setShowSignOutAlert(false);
  };

  return (
    <>
      <View className="mb-6 p-4 rounded-lg" style={{ backgroundColor: Colors.surface }}>
        {!isAuthenticated && (
          <View className="mt-4">
            <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
              Sign in to sync your data across devices
            </Text>
            <TouchableOpacity
              className="w-full h-12 rounded-lg items-center justify-center"
              style={{ backgroundColor: Colors.primary }}
              onPress={() => setShowLoginOverlay(true)}
            >
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isAuthenticated && (
          <>
            <View className="mt-4 p-3 rounded-lg mb-4" style={{ backgroundColor: Colors.card }}>
              <Text className="text-sm text-center" style={{ color: Colors.success }}>
                ✅ Connected to cloud database
              </Text>
            </View>
            <Text className="text-xl font-semibold mb-3" style={{ color: Colors.text }}>
              Account
            </Text>
            <Text className="text-base mb-3" style={{ color: Colors.textSecondary }}>
              Signed in as: {user?.email}
            </Text>
            <TouchableOpacity
              className="w-full h-12 rounded-lg items-center justify-center"
              style={{ backgroundColor: Colors.error }}
              onPress={handleSignOut}
            >
              <Text className="text-white font-semibold text-base">
                Sign Out
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <OAuthErrorModal
        visible={!!oauthError}
        errorMessage={oauthError || ''}
        onClose={handleCloseOAuthError}
      />

      <SignOutAlertModal
        visible={showSignOutAlert}
        onConfirm={confirmSignOut}
        onCancel={cancelSignOut}
      />

      <LoginOverlay
        visible={showLoginOverlay}
        onClose={handleCloseLogin}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

