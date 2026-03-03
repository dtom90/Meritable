import React from 'react';
import { View, ViewProps } from 'react-native';
import { Colors } from '@/lib/Colors';
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
  const backgroundColor = isDragging ? '#e0e0e0' : Colors.surface;

  return (
    <View ref={ref} style={[isDragging && { opacity: 0.5 }, style]} {...props}>
      <PillButton
        backgroundColor={backgroundColor}
        dragHandleProps={dragHandleProps ?? undefined}
        text={habit.name}
      />
    </View>
  );
});

export default HabitReorderItem;
