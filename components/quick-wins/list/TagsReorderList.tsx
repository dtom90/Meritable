import React, { useCallback } from 'react';
import { View, Platform, ScrollView } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TagReorderItem from './TagReorderItem';
import type { Tag } from '@/db/types';
import Spinner from '@/components/common/Spinner';

type TagsReorderListProps = {
  tags: Tag[];
  onReorder: (tags: Tag[]) => void;
  isLoading?: boolean;
};

function SortableTagItem({ tag }: { tag: Tag }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TagReorderItem
      ref={setNodeRef as any}
      style={style}
      tag={tag}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

function TagsReorderListWeb({ tags, onReorder, isLoading }: TagsReorderListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = tags.findIndex((t) => t.id.toString() === active.id);
        const newIndex = tags.findIndex((t) => t.id.toString() === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(tags, oldIndex, newIndex).map((t, i) => ({ ...t, order: i }));
          onReorder(reordered);
        }
      }
    },
    [tags, onReorder]
  );

  if (isLoading) return <Spinner />;
  if (tags.length === 0) return <View className="py-4" />;

  return (
    <ScrollView
      className="max-h-80"
      showsVerticalScrollIndicator
      keyboardShouldPersistTaps="handled"
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={tags.map((t) => t.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {tags.map((tag) => (
            <SortableTagItem key={tag.id} tag={tag} />
          ))}
        </SortableContext>
      </DndContext>
    </ScrollView>
  );
}

function TagsReorderListMobile({ tags, onReorder, isLoading }: TagsReorderListProps) {
  const renderItem = useCallback(
    ({ item: tag, drag, isActive }: RenderItemParams<Tag>) => (
      <ScaleDecorator>
        <TagReorderItem
          tag={tag}
          isDragging={isActive}
          dragHandleProps={{
            onLongPress: drag,
            disabled: isActive,
            delayLongPress: 0,
          }}
        />
      </ScaleDecorator>
    ),
    []
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Tag[] }) => {
      const reordered = data.map((t, i) => ({ ...t, order: i }));
      onReorder(reordered);
    },
    [onReorder]
  );

  if (isLoading) return <Spinner />;
  if (tags.length === 0) return <View className="py-4" />;

  return (
    <GestureHandlerRootView style={{ maxHeight: 320 }}>
      <DraggableFlatList
        data={tags}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </GestureHandlerRootView>
  );
}

export default function TagsReorderList(props: TagsReorderListProps) {
  return Platform.OS === 'web' ? (
    <TagsReorderListWeb {...props} />
  ) : (
    <TagsReorderListMobile {...props} />
  );
}
