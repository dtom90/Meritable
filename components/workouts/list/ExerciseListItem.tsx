import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import type { Exercise } from '@/db/types';
import PillButton, { type PillButtonDragHandleProps } from '@/components/common/PillButton';
import { Colors } from '@/lib/Colors';

type ExerciseListItemProps = ViewProps & {
  exercise: Exercise;
  onPress: () => void;
  isDragging?: boolean;
  dragHandleProps?: PillButtonDragHandleProps | null;
  /** When true, row is highlighted (e.g. at least one set completed on selected date). */
  isCompletedOnSelectedDate?: boolean;
  /** When >= 1, shown on the pill (e.g. "3 sets"). */
  setCount?: number;
};

export const ExerciseListItem = React.forwardRef<View, ExerciseListItemProps>(
  function ExerciseListItem(
    {
      exercise,
      onPress,
      isDragging = false,
      dragHandleProps,
      isCompletedOnSelectedDate = false,
      setCount,
      style,
      ...props
    },
    ref
  ) {
    const setCountLabel =
      setCount != null && setCount >= 1
        ? `${setCount} set${setCount === 1 ? '' : 's'}`
        : null;

    return (
      <View
        ref={ref}
        style={[isDragging && { opacity: 0.5 }, style]}
        {...props}
      >
        <PillButton
          isDragging={isDragging}
          highlightAsCompleted={isCompletedOnSelectedDate}
          onMainPress={onPress}
          dragHandleProps={dragHandleProps ?? undefined}
          text={exercise.name}
          showCompletedCheckIcon
        >
          {setCountLabel != null ? (
            <View className="flex-row flex-wrap justify-center gap-1">
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: Colors.border }}
              >
                <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                  {setCountLabel}
                </Text>
              </View>
            </View>
          ) : null}
        </PillButton>
      </View>
    );
  }
);
