import React, { useCallback, useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
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
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Spinner from '@/components/common/Spinner';
import ReorderItem from '@/components/common/ReorderItem';

export interface ReorderEditLayoutProps<T = unknown> {
  children?: React.ReactNode;
  footer: React.ReactNode;
  data?: T[];
  getItemId?: (item: T) => string;
  getItemLabel?: (item: T) => string;
  onReorder?: (reorderedData: T[]) => void;
  loading?: boolean;
}

const EXTRA_HEIGHT = 16;

function SortableRow<T>({
  item,
  getItemId,
  getItemLabel,
}: {
  item: T;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
}) {
  const id = getItemId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ReorderItem
      ref={setNodeRef as React.Ref<View>}
      label={getItemLabel(item)}
      style={style}
      isActive={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

export function ReorderEditLayout<T = unknown>({
  children,
  footer,
  data,
  getItemId,
  getItemLabel,
  onReorder,
  loading = false,
}: ReorderEditLayoutProps<T>) {
  const wrapperClassName = 'flex-1 min-h-0';
  const [contentHeight, setContentHeight] = useState(EXTRA_HEIGHT);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (data == null || getItemId == null || onReorder == null) return;
      const { active, over } = event;
      if (over == null || active.id === over.id) return;
      const oldIndex = data.findIndex(
        (item) => getItemId(item) === String(active.id)
      );
      const newIndex = data.findIndex(
        (item) => getItemId(item) === String(over.id)
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        const newData = arrayMove(data, oldIndex, newIndex);
        onReorder(newData);
      }
    },
    [data, getItemId, onReorder]
  );

  const useGenericList =
    data !== undefined &&
    getItemId !== undefined &&
    getItemLabel !== undefined &&
    onReorder !== undefined;

  if (Platform.OS === 'web') {
    if (useGenericList && data) {
      if (loading) {
        return (
          <View className={wrapperClassName}>
            <Spinner />
          </View>
        );
      }

      const itemIds = data.map((item) => getItemId(item));

      return (
        <View className={wrapperClassName}>
          <ScrollView
            className="flex-1 min-h-0"
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                {data.map((item) => (
                  <SortableRow
                    key={getItemId(item)}
                    item={item}
                    getItemId={getItemId}
                    getItemLabel={getItemLabel}
                  />
                ))}
              </SortableContext>
            </DndContext>
            {footer}
          </ScrollView>
        </View>
      );
    }

    return (
      <View className={wrapperClassName}>
        <ScrollView
          className="flex-1 min-h-0"
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          {children}
          {footer}
        </ScrollView>
      </View>
    );
  }

  if (useGenericList && data) {
    if (loading) {
      return (
        <View className={wrapperClassName}>
          <Spinner />
        </View>
      );
    }

    return (
      <View className={wrapperClassName}>
        <GestureHandlerRootView
          style={
            contentHeight > 0 ? { height: contentHeight } : { flex: 1 }
          }
        >
          <DraggableFlatList
            data={data}
            onDragEnd={({ data: reordered }) => onReorder(reordered)}
            onContentSizeChange={(_w, h) =>
              setContentHeight(h + EXTRA_HEIGHT)
            }
            keyExtractor={getItemId}
            renderItem={({ item, drag, isActive }) => (
              <ReorderItem
                label={getItemLabel(item)}
                drag={drag}
                isActive={isActive}
              />
            )}
            ListFooterComponent={
              footer != null ? () => <>{footer}</> : undefined
            }
          />
        </GestureHandlerRootView>
      </View>
    );
  }

  return (
    <View className={wrapperClassName}>
      {children}
    </View>
  );
}
