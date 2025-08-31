import React, { useState, useEffect, useCallback } from 'react';
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
import { Habit } from '@/db/types';
import { Colors } from '@/constants/Colors';
import HabitItem from './HabitItem';
import { useListHabits, useReorderHabits } from '@/db/useHabitDb';

export default function HabitsList() {
  const { data: habits = [], isLoading } = useListHabits();
  const { mutate: reorderHabits } = useReorderHabits();

  // const [orderedHabits, setOrderedHabits] = useState<Habit[]>(habits);

  // Initialize ordered habits when data loads
  // useEffect(() => {
  //   if (habits.length > 0) {
  //     setOrderedHabits([...habits]);
  //   }
  // }, [habits]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    console.log('active', active);
    console.log('over', over);

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
        
        console.log('Habits reordered with order:', reorderedHabits.map(h => ({ name: h.name, order: h.order })));
        reorderHabits(reorderedHabits);
      }
    }
  }, [habits, reorderHabits]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
        <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
          <Text style={{ color: Colors.text }}>Loading habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ minHeight: 200 }}>
      <Text className="mb-4 text-center text-sm" style={{ color: Colors.textSecondary }}>
        Drag and drop to reorder habits
      </Text>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={habits.map(h => h.id?.toString() || '')} strategy={verticalListSortingStrategy}>
          {habits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} />
          ))}
        </SortableContext>
      </DndContext>
    </View>
  );
}
