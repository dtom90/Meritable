import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Colors } from '@/lib/Colors';
import { ExerciseListItem } from './ExerciseListItem';
import { useListExercises, useReorderExercises } from '@/db/useWorkoutDb';
import type { Exercise } from '@/db/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Spinner from '@/components/Spinner';

export function ExerciseListMobile() {
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

  const handleDragEnd = useCallback(
    ({ data }: { data: Exercise[] }) => {
      const reordered = data.map((ex, index) => ({ ...ex, order: index }));
      reorderExercises(reordered);
    },
    [reorderExercises]
  );

  const renderItem = useCallback(
    ({ item: exercise, drag, isActive }: RenderItemParams<Exercise>) => {
      return (
        <ScaleDecorator>
          <ExerciseListItem
            exercise={exercise}
            onPress={() => handlePressExercise(exercise)}
            isDragging={isActive}
            dragHandleProps={{
              onLongPress: drag,
              disabled: isActive,
              delayLongPress: 0,
            }}
          />
        </ScaleDecorator>
      );
    },
    [handlePressExercise]
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DraggableFlatList
        data={exercises}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id?.toString() ?? ''}
        renderItem={renderItem}
      />
    </GestureHandlerRootView>
  );
}
