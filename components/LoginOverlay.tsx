import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

interface LoginOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginOverlay({ visible, onClose, onSuccess }: LoginOverlayProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = isSignUp 
        ? await signUp(email.trim(), password)
        : await signIn(email.trim(), password);

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        onSuccess();
        setEmail('');
        setPassword('');
        setIsSignUp(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
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
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
          
          <Text className="text-base mb-4 text-center" style={{ color: Colors.textSecondary }}>
            {isSignUp 
              ? 'Create an account to sync your habits to the cloud'
              : 'Sign in to access your cloud data'
            }
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

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px" style={{ backgroundColor: Colors.border }} />
            <Text className="mx-4 text-sm" style={{ color: Colors.textSecondary }}>
              or
            </Text>
            <View className="flex-1 h-px" style={{ backgroundColor: Colors.border }} />
          </View>

          <TextInput
            className="w-full h-12 px-4 mb-4 rounded-lg text-base"
            style={{ 
              backgroundColor: Colors.card,
              color: Colors.text,
              borderWidth: 1,
              borderColor: Colors.border
            }}
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <TextInput
            className="w-full h-12 px-4 mb-6 rounded-lg text-base"
            style={{ 
              backgroundColor: Colors.card,
              color: Colors.text,
              borderWidth: 1,
              borderColor: Colors.border
            }}
            placeholder="Password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            className="w-full h-12 rounded-lg mb-4 items-center justify-center"
            style={{ backgroundColor: Colors.primary }}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-base">
              {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full items-center"
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text className="text-base" style={{ color: Colors.primary }}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full items-center mt-4"
            onPress={onClose}
            disabled={isLoading}
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
