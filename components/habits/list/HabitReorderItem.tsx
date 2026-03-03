import React from 'react';
import { View, ViewProps } from 'react-native';
import { Habit } from '@/db/types';
import PillButton, { type PillButtonDragHandleProps } from '@/components/common/PillButton';

interface HabitReorderItemProps extends ViewProps {
  habit: Habit;
  isEditMode?: boolean;
  isDragging?: boolean;
  dragHandleProps?: PillButtonDragHandleProps | null;
}

const HabitReorderItem = React.forwardRef<View, HabitReorderItemProps>(function HabitReorderItem(
  {
    habit,
    isEditMode = false,
    isDragging = false,
    dragHandleProps,
    style,
    ...props
  },
  ref
) {
  return (
    <View ref={ref} style={[isDragging && { opacity: 0.5 }, style]} {...props}>
      <PillButton
        isDragging={isDragging}
        dragHandleProps={dragHandleProps ?? undefined}
        text={habit.name}
      />
    </View>
  );
});

export default HabitReorderItem;
