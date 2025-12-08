import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/lib/Colors';

interface SignOutAlertModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SignOutAlertModal({ visible, onConfirm, onCancel }: SignOutAlertModalProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
      <View className="rounded-lg p-6 mx-4 max-w-sm w-full" style={{ backgroundColor: Colors.card }}>
        <Text className="text-xl font-bold mb-3 text-center" style={{ color: Colors.text }}>
          Sign Out
        </Text>
        <Text className="text-base mb-6 text-center" style={{ color: Colors.textSecondary }}>
          Are you sure you want to sign out?
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 h-12 rounded-lg items-center justify-center"
            style={{ backgroundColor: Colors.textTertiary }}
            onPress={onCancel}
          >
            <Text className="text-white font-semibold text-base">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-12 rounded-lg items-center justify-center"
            style={{ backgroundColor: Colors.error }}
            onPress={onConfirm}
          >
            <Text className="text-white font-semibold text-base">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

