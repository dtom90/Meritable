import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
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
import { Colors } from '@/lib/Colors';
import { ExerciseListItem } from './ExerciseListItem';
import { useListExercises, useReorderExercises } from '@/db/useWorkoutDb';
import type { Exercise } from '@/db/types';
import Spinner from '@/components/common/Spinner';

function SortableExerciseItem({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id?.toString() ?? '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ExerciseListItem
      ref={setNodeRef as React.Ref<View>}
      style={style}
      exercise={exercise}
      onPress={onPress}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}

export function ExerciseReorderListWeb() {
  const router = useRouter();
  const { data: exercises = [], isLoading } = useListExercises();
  const { mutate: reorderExercises } = useReorderExercises();

  const handlePressExercise = useCallback(
    (exercise: Exercise) => {
      if (exercise.id != null) {
        router.push(`/workouts/${exercise.id}`);
      }
    },
    [router]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over != null && active.id !== over.id) {
        const oldIndex = exercises.findIndex(
          (item) => item.id?.toString() === active.id
        );
        const newIndex = exercises.findIndex(
          (item) => item.id?.toString() === over.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(exercises, oldIndex, newIndex);
          const reordered = newItems.map((ex, index) => ({
            ...ex,
            order: index,
          }));
          reorderExercises(reordered);
        }
      }
    },
    [exercises, reorderExercises]
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (exercises.length === 0) {
    return (
      <Text style={{ color: Colors.textSecondary }}>
        No exercises yet. Add one above.
      </Text>
    );
  }

  return (
    <View>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map((e) => e.id?.toString() ?? '')}
          strategy={verticalListSortingStrategy}
        >
          {exercises.map((exercise) => (
            <SortableExerciseItem
              key={exercise.id}
              exercise={exercise}
              onPress={() => handlePressExercise(exercise)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </View>
  );
}
