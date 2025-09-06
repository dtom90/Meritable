import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useAuth } from '@/db/AuthContext';

interface LoginOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginOverlay({ visible, onClose, onSuccess }: LoginOverlayProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Google OAuth will redirect, so we don't call onSuccess here
        // The auth state change will handle the success
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during Google sign-in');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: Colors.overlay }}>
        <View 
          className="mx-5 p-6 rounded-xl w-full max-w-sm"
          style={{ backgroundColor: Colors.surface }}
        >
          <Text className="text-2xl font-bold text-center mb-6" style={{ color: Colors.text }}>
            Sign In
          </Text>
          
          <Text className="text-base mb-6 text-center" style={{ color: Colors.textSecondary }}>
            Sign in with Google to sync your habits to the cloud
          </Text>

          {/* Google Sign In Button */}
          <TouchableOpacity
            className="w-full h-12 rounded-lg mb-6 items-center justify-center flex-row"
            style={{ backgroundColor: '#4285F4' }}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <Text className="text-white font-semibold text-base">
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full items-center mt-4"
            onPress={onClose}
            disabled={isGoogleLoading}
          >
            <Text className="text-base" style={{ color: Colors.textSecondary }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
