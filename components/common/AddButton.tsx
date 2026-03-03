import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/Colors';

export interface AddButtonProps {
  onPress: () => void;
}

/**
 * Circular primary FAB-style button with add icon. Use for "Add" actions (e.g. Add Habit, Add Exercise, Add Task).
 */
export function AddButton({ onPress }: AddButtonProps) {
  return (
    <View className="flex-1 justify-center items-center my-4">
      <TouchableOpacity
        className="relative w-16 h-16 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: Colors.primary }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={40} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}
