import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
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

interface HabitsListProps {
  habits: Habit[];
}

export default function HabitsList({ habits }: HabitsListProps) {
  const [orderedHabits, setOrderedHabits] = useState<Habit[]>([]);

  // Initialize ordered habits when data loads
  React.useEffect(() => {
    if (habits.length > 0) {
      setOrderedHabits([...habits]);
    }
  }, [habits]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedHabits((items) => {
        const oldIndex = items.findIndex((item) => item.id?.toString() === active.id);
        const newIndex = items.findIndex((item) => item.id?.toString() === over?.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          console.log('Habits reordered (temporary):', newItems.map(h => h.name));
          return newItems;
        }
        return items;
      });
    }
  };

  return (
    <View style={{ minHeight: 200 }}>
      <Text className="mb-4 text-center text-sm" style={{ color: Colors.textSecondary }}>
        Drag and drop to reorder habits (temporary)
      </Text>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={orderedHabits.map(h => h.id?.toString() || '')} strategy={verticalListSortingStrategy}>
          {orderedHabits.map((habit) => (
            <HabitItem key={habit.id} habit={habit} />
          ))}
        </SortableContext>
      </DndContext>
    </View>
  );
}
