import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/lib/Colors';

interface OAuthErrorModalProps {
  visible: boolean;
  errorMessage: string;
  onClose: () => void;
}

export default function OAuthErrorModal({ visible, errorMessage, onClose }: OAuthErrorModalProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
      <View className="rounded-lg p-6 mx-4 max-w-sm w-full" style={{ backgroundColor: Colors.card }}>
        <Text className="text-xl font-bold mb-3 text-center" style={{ color: Colors.text }}>
          Login Failed
        </Text>
        <Text className="text-base mb-6 text-center" style={{ color: Colors.textSecondary }}>
          {errorMessage}
        </Text>
        <TouchableOpacity
          className="w-full h-12 rounded-lg items-center justify-center"
          style={{ backgroundColor: Colors.primary }}
          onPress={onClose}
        >
          <Text className="text-white font-semibold text-base">
            OK
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

