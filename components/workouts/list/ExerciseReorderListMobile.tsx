import React, { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Colors } from '@/lib/Colors';
import { ExerciseListItem } from './ExerciseListItem';
import { useListExercises, useReorderExercises } from '@/db/useWorkoutDb';
import type { Exercise } from '@/db/types';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Spinner from '@/components/common/Spinner';

export function ExerciseReorderListMobile() {
  const router = useRouter();
  const { data: exercises = [], isLoading } = useListExercises();
  const { mutate: reorderExercises } = useReorderExercises();
  const EXTRA_HEIGHT = 16;
  const [contentHeight, setContentHeight] = useState(EXTRA_HEIGHT);

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
    <GestureHandlerRootView
      style={
        contentHeight > 0
          ? { height: contentHeight }
          : { flex: 1 }
      }
    >
      <DraggableFlatList
        data={exercises}
        onDragEnd={handleDragEnd}
        onContentSizeChange={(_w, h) => setContentHeight(h + EXTRA_HEIGHT)}
        keyExtractor={(item) => item.id?.toString() ?? ''}
        renderItem={renderItem}
      />
    </GestureHandlerRootView>
  );
}
