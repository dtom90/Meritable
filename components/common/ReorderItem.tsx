import React from 'react';
import { View, ViewProps } from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import PillButton, { type PillButtonDragHandleProps } from '@/components/common/PillButton';

export interface ReorderItemProps extends ViewProps {
  label: string;
  isActive?: boolean;
  /** Web: from useSortable attributes + listeners */
  dragHandleProps?: PillButtonDragHandleProps | null;
  /** Mobile: long-press to drag */
  drag?: () => void;
}

const ReorderItem = React.forwardRef<View, ReorderItemProps>(function ReorderItem(
  { label, isActive = false, dragHandleProps, drag, style, ...props },
  ref
) {
  const isWeb = dragHandleProps != null;
  const resolvedDragHandleProps = isWeb
    ? dragHandleProps!
    : drag != null
      ? { onLongPress: drag, disabled: isActive, delayLongPress: 0 }
      : undefined;

  const content = (
    <View ref={ref} style={[isActive && { opacity: 0.5 }, style]} {...props}>
      <PillButton
        isDragging={isActive}
        dragHandleProps={resolvedDragHandleProps ?? undefined}
        text={label}
      />
    </View>
  );

  return isWeb ? content : <ScaleDecorator>{content}</ScaleDecorator>;
});

export default ReorderItem;
