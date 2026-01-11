import React from 'react';
import { View, Text, Pressable, Platform, ViewProps } from 'react-native';
import { Colors } from '@/lib/Colors';
import { Icon } from 'react-native-paper';
import { Habit } from '@/db/habitDatabase';

interface HabitReorderItemProps extends ViewProps {
  habit: Habit;
  isEditMode?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const HabitReorderItem = React.forwardRef<View, HabitReorderItemProps>(function HabitReorderItem(
  { 
    habit,
    isEditMode = false,
    isDragging = false,
    dragHandleProps = {},
    style,
    ...props 
  }, 
  ref
) {
  return (
    <View 
      ref={ref}
      className={`flex-row items-center p-4 my-4 rounded-lg min-h-[68px] ${isDragging ? 'opacity-50' : ''}`} 
      style={[{ backgroundColor: isDragging ? '#e0e0e0' : Colors.surface }, style]}
      {...props}
    >
      {Platform.OS === 'web' ? (<Pressable
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 },
          { cursor: 'grab' }
        ]}
        className="mr-3"
        {...dragHandleProps}
      >
        <Icon source="drag" color={Colors.textSecondary} size={20} />
      </Pressable>
      ) : (
        <View>
          <Icon source="drag" color={Colors.textSecondary} size={20} />
        </View>
      )}
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center justify-center">
          <Text className="text-lg text-center" style={{ color: Colors.text }}>{habit.name}</Text>
        </View>
      </View>
    </View>
  );
});

export default HabitReorderItem;
