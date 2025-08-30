import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Icon } from 'react-native-paper';
import { Habit } from '@/db/types';

interface HabitItemProps {
  habit: Habit;
  isActive?: boolean;
  onLongPress?: () => void;
}

export default function HabitItem({ habit, isActive = false, onLongPress }: HabitItemProps) {
  const router = useRouter();

  return (
    <Pressable
      onLongPress={onLongPress}
      style={({ pressed }) => [
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <View 
        className={`flex-row items-center p-4 my-4 rounded-lg min-h-[68px] ${isActive ? 'opacity-50' : ''}`} 
        style={{ backgroundColor: Colors.surface }}
      >
        {/* Drag Handle */}
        <View className="mr-3">
          <Icon source="drag" color={Colors.textSecondary} size={20} />
        </View>

        {/* Track Button */}
        <View className="flex-row items-center gap-2">
          <Icon source="clock" color={Colors.textSecondary} size={24} />
          <Text style={{ color: Colors.textSecondary }}>Track</Text>
        </View>

        {/* Habit Name */}
        <View className="flex-1 flex-row items-center justify-center">
          <Text className="text-lg text-center" style={{ color: Colors.text }}>{habit.name}</Text>
        </View>

        {/* Chevron */}
        <View>
          <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
        </View>
      </View>
    </Pressable>
  );
}
