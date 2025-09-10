import React, { useCallback } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
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
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Colors } from '@/lib/Colors';
import HabitItem from './HabitItem';
import { useListHabits, useReorderHabits } from '@/db/useHabitDb';
import { Habit } from '@/db/types';

function SortableHabitItem({ habit }: { habit: Habit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id?.toString() || '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <HabitItem
      ref={setNodeRef as any}
      style={style}
      habit={habit}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

export default function HabitsListWeb() {
  const { data: habits = [], isLoading } = useListHabits();
  const { mutate: reorderHabits } = useReorderHabits();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = habits.findIndex((item) => item.id?.toString() === active.id);
      const newIndex = habits.findIndex((item) => item.id?.toString() === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(habits, oldIndex, newIndex);
        
        // Set the order attribute based on the new position
        const reorderedHabits = newItems.map((habit, index) => ({
          ...habit,
          order: index
        }));
        
        reorderHabits(reorderedHabits);
      }
    }
  }, [habits, reorderHabits]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: Colors.text }}>Loading habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (habits.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
      </View>
    );
  }

  return (
    <View style={{ minHeight: 200 }}>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={habits.map(h => h.id?.toString() || '')} strategy={verticalListSortingStrategy}>
          {habits.map((habit) => (
            <SortableHabitItem key={habit.id} habit={habit} />
          ))}
        </SortableContext>
      </DndContext>
      
      <View className="space-y-3">
        <Text>&nbsp;</Text>
      </View>
      
    </View>
  );
}
