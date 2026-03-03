import React from 'react';
import { View, ViewProps } from 'react-native';
import type { Tag } from '@/db/types';
import PillButton, { type PillButtonDragHandleProps } from '@/components/common/PillButton';

interface TagReorderItemProps extends ViewProps {
  tag: Tag;
  isDragging?: boolean;
  dragHandleProps?: PillButtonDragHandleProps | null;
}

const TagReorderItem = React.forwardRef<View, TagReorderItemProps>(function TagReorderItem(
  { tag, isDragging = false, dragHandleProps, style, ...props },
  ref
) {
  return (
    <View ref={ref} style={[isDragging && { opacity: 0.5 }, style]} {...props}>
      <PillButton
        isDragging={isDragging}
        dragHandleProps={dragHandleProps ?? undefined}
        text={tag.name}
      />
    </View>
  );
});

export default TagReorderItem;
