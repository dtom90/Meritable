import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import { ExerciseListItem } from './ExerciseListItem';
import { useListExercises } from '@/db/useWorkoutDb';
import type { Exercise } from '@/db/types';
import Spinner from '@/components/common/Spinner';

/** Standard (non-reorder) exercise list for both web and mobile. */
export function ExerciseListStandard() {
  const router = useRouter();
  const { data: exercises = [], isLoading } = useListExercises();

  const handlePressExercise = useCallback(
    (exercise: Exercise) => {
      if (exercise.id != null) {
        router.push(`/workouts/${exercise.id}`);
      }
    },
    [router]
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
    <View className="gap-2">
      {exercises.map((exercise) => (
        <ExerciseListItem
          key={exercise.id}
          exercise={exercise}
          onPress={() => handlePressExercise(exercise)}
        />
      ))}
    </View>
  );
}
