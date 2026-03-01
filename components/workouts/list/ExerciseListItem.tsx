import React from 'react';
import { Text, Pressable, View, ViewProps, type ViewStyle } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Exercise } from '@/db/types';
import { Icon } from 'react-native-paper';

type ExerciseListItemProps = ViewProps & {
  exercise: Exercise;
  onPress: () => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
};

export const ExerciseListItem = React.forwardRef<View, ExerciseListItemProps>(
  function ExerciseListItem(
    { exercise, onPress, isDragging = false, dragHandleProps, style, ...props },
    ref
  ) {
    const showDragHandle = dragHandleProps != null;
    return (
      <View
        ref={ref}
        className={`flex-row items-center p-4 my-4 rounded-lg min-h-[68px] ${isDragging ? 'opacity-50' : ''}`}
        style={[
          { backgroundColor: isDragging ? '#e0e0e0' : Colors.surface },
          style,
        ]}
        {...props}
      >
        {showDragHandle && (
          <Pressable
            style={({ pressed }) =>
              [
                { opacity: pressed ? 0.7 : 1 },
                { cursor: 'grab' as ViewStyle['cursor'] },
              ] as ViewStyle[]
            }
            className="mr-3"
            {...dragHandleProps}
          >
            <Icon source="drag" color={Colors.textSecondary} size={20} />
          </Pressable>
        )}
        <Pressable
          onPress={onPress}
          className="flex-1 flex-row items-center justify-center"
        >
          <Text style={{ color: Colors.text, fontSize: 17 }}>{exercise.name}</Text>
          <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
        </Pressable>
      </View>
    );
  }
);
