import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Icon } from 'react-native-paper';
import { Habit } from '@/db/types';

interface HabitItemProps {
  habit: Habit;
}

export default function HabitItem({ habit }: HabitItemProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center p-4 my-4 rounded-lg min-h-[68px]" style={{ backgroundColor: Colors.surface }}>
      <TouchableOpacity className="flex-row items-center gap-2" onPress={() => router.push('/(tabs)?today=true')}>
        <Icon source="clock" color={Colors.textSecondary} size={24} />
        <Text style={{ color: Colors.textSecondary }}>Track</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="flex-1 flex-row items-center justify-center" 
        onPress={() => router.push(`/habits/${habit.id}`)}
      >
        <Text className="text-lg text-center" style={{ color: Colors.text }}>{habit.name}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push(`/habits/${habit.id}`)}>
        <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
      </TouchableOpacity>
    </View>
  );
}
