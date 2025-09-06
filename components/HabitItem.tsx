import React from 'react';
import { View, Text, Pressable, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { Icon } from 'react-native-paper';
import { Habit } from '@/db/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HabitItemProps {
  habit: Habit;
  isActive?: boolean;
  onLongPress?: () => void;
}

export default function HabitItem({ habit, isActive = false, onLongPress }: HabitItemProps) {
  const router = useRouter();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id?.toString() || '' });

  const style = {
    backgroundColor: isDragging ? '#e0e0e0' : Colors.surface,
    opacity: isDragging ? 0.5 : 1,
    ...(Platform.OS === 'web' && {
      transform: CSS.Transform.toString(transform),
      transition,
    }),
  };

  const handleHabitPress = () => {
    if (habit.id) {
      router.push(`/habits/${habit.id}`);
    }
  };

  return (
    <View 
      ref={setNodeRef}
      className={`flex-row items-center p-4 my-4 rounded-lg min-h-[68px] ${isActive ? 'opacity-50' : ''}`} 
      style={[style, { backgroundColor: isDragging ? '#e0e0e0' : Colors.surface }]}
    >
      {/* Drag Handle - Pressable and Draggable */}
      <Pressable
        onLongPress={onLongPress}
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 },
          Platform.OS === 'web' && { cursor: 'grab' }
        ]}
        className="mr-3"
        {...attributes}
        {...listeners}
      >
        <Icon source="drag" color={Colors.textSecondary} size={20} />
      </Pressable>

      {/* Habit Name and Chevron - Touchable and Navigates to Habit Page */}
      <TouchableOpacity
        onPress={handleHabitPress}
        className="flex-1 flex-row items-center justify-between"
        activeOpacity={0.7}
      >
        <View className="flex-1 flex-row items-center justify-center">
          <Text className="text-lg text-center" style={{ color: Colors.text }}>{habit.name}</Text>
        </View>

        <View>
          <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
