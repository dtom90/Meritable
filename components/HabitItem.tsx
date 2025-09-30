import React from 'react';
import { View, Text, Pressable, TouchableOpacity, Platform, ViewProps } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { Icon } from 'react-native-paper';
import { Habit } from '@/db/types';

interface HabitItemProps extends ViewProps {
  habit: Habit;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const HabitItem = React.forwardRef<View, HabitItemProps>(function HabitItem(
  { 
    habit, 
    isDragging = false, 
    dragHandleProps = {},
    style,
    ...props 
  }, 
  ref
) {
  const router = useRouter();

  const handleHabitPress = () => {
    if (habit.id) {
      router.push(`/habits/${habit.id}`);
    }
  };

  return (
    <View 
      ref={ref}
      className={`flex-row items-center p-4 my-4 rounded-lg min-h-[68px] ${isDragging ? 'opacity-50' : ''}`} 
      style={[{ backgroundColor: isDragging ? '#e0e0e0' : Colors.surface }, style]}
      {...props}
    >
      {/* Drag Handle - Pressable and Draggable */}
      <Pressable
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 },
          Platform.OS === 'web' && { cursor: 'grab' }
        ]}
        className="mr-3"
        {...dragHandleProps}
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
});

export default HabitItem;
