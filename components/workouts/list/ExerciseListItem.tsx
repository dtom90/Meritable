import React from 'react';
import { View, ViewProps } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Exercise } from '@/db/types';
import PillButton, { type PillButtonDragHandleProps } from '@/components/common/PillButton';

type ExerciseListItemProps = ViewProps & {
  exercise: Exercise;
  onPress: () => void;
  isDragging?: boolean;
  dragHandleProps?: PillButtonDragHandleProps | null;
  /** When true, row is highlighted (e.g. at least one set completed on selected date). */
  isCompletedOnSelectedDate?: boolean;
};

export const ExerciseListItem = React.forwardRef<View, ExerciseListItemProps>(
  function ExerciseListItem(
    { exercise, onPress, isDragging = false, dragHandleProps, isCompletedOnSelectedDate = false, style, ...props },
    ref
  ) {
    const backgroundColor = isDragging
      ? '#e0e0e0'
      : isCompletedOnSelectedDate
        ? Colors.success
        : Colors.card;

    return (
      <View
        ref={ref}
        style={[isDragging && { opacity: 0.5 }, style]}
        {...props}
      >
        <PillButton
          backgroundColor={backgroundColor}
          onMainPress={onPress}
          dragHandleProps={dragHandleProps ?? undefined}
          text={exercise.name}
        />
      </View>
    );
  }
);
