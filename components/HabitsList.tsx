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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Habit } from '@/db/types';
import { Colors } from '@/constants/Colors';

interface HabitsListProps {
  habits: Habit[];
}

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
    backgroundColor: isDragging ? '#e0e0e0' : Colors.surface,
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDragging ? '#ff0000' : '#ccc',
    opacity: isDragging ? 0.5 : 1,
    ...(Platform.OS === 'web' && {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: 'grab' as const,
    }),
  };

  return (
    <View
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Text style={{ 
        fontSize: 18, 
        textAlign: 'center',
        color: isDragging ? '#ff0000' : Colors.text,
        fontWeight: isDragging ? 'bold' : 'normal'
      }}>
        {habit.name} {isDragging ? '(DRAGGING)' : ''}
      </Text>
    </View>
  );
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
            <SortableHabitItem key={habit.id} habit={habit} />
          ))}
        </SortableContext>
      </DndContext>
    </View>
  );
}
