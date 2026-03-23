import React, { useCallback, useState } from 'react';
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
import { useReorderTags, useTagsQuery } from '@/db/useTags';

type TagsReorderListContentProps = {
  tags: Tag[];
  isLoading: boolean;
};

function SortableTagItem({
  tag,
  editingTagId,
  setEditingTagId,
}: {
  tag: Tag;
  editingTagId: number | null;
  setEditingTagId: (id: number | null) => void;
}) {
  const dragFrozen = editingTagId != null;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id.toString(), disabled: dragFrozen });

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
      onEditingChange={setEditingTagId}
      dragFrozen={dragFrozen}
    />
  );
}

function TagsReorderListWeb({ tags, isLoading }: TagsReorderListContentProps) {
  const { mutate: reorderTags } = useReorderTags();
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
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
          reorderTags(reordered);
        }
      }
    },
    [tags, reorderTags]
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
            <SortableTagItem
              key={tag.id}
              tag={tag}
              editingTagId={editingTagId}
              setEditingTagId={setEditingTagId}
            />
          ))}
        </SortableContext>
      </DndContext>
    </ScrollView>
  );
}

function TagsReorderListMobile({ tags, isLoading }: TagsReorderListContentProps) {
  const { mutate: reorderTags } = useReorderTags();
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const dragFrozen = editingTagId != null;

  const renderItem = useCallback(
    ({ item: tag, drag, isActive }: RenderItemParams<Tag>) => (
      <ScaleDecorator>
        <TagReorderItem
          tag={tag}
          isDragging={isActive}
          dragHandleProps={
            dragFrozen
              ? null
              : {
                  onLongPress: drag,
                  disabled: isActive,
                  delayLongPress: 0,
                }
          }
          onEditingChange={setEditingTagId}
          dragFrozen={dragFrozen}
        />
      </ScaleDecorator>
    ),
    [dragFrozen]
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Tag[] }) => {
      const reordered = data.map((t, i) => ({ ...t, order: i }));
      reorderTags(reordered);
    },
    [reorderTags]
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

export default function TagsReorderList() {
  const { data: tags = [], isLoading } = useTagsQuery();
  const contentProps: TagsReorderListContentProps = { tags, isLoading };
  return Platform.OS === 'web' ? (
    <TagsReorderListWeb {...contentProps} />
  ) : (
    <TagsReorderListMobile {...contentProps} />
  );
}
