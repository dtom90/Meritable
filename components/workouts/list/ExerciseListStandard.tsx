import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { Colors } from '@/lib/Colors';
import { ExerciseListItem } from './ExerciseListItem';
import { useListExercises, SETS_QUERY_KEY } from '@/db/useWorkoutDb';
import { useDataSource } from '@/db/DataSourceContext';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { formatDate } from '@/lib/dateUtils';
import type { Exercise } from '@/db/types';
import Spinner from '@/components/common/Spinner';

/** Standard (non-reorder) exercise list for both web and mobile. */
export function ExerciseListStandard() {
  const router = useRouter();
  const { selectedDate } = useSelectedDate();
  const { data: exercises = [], isLoading } = useListExercises();
  const { activeDb, isInitialized } = useDataSource();

  const setQueries = useQueries({
    queries: exercises.map((ex) => ({
      queryKey: [SETS_QUERY_KEY, ex.id],
      queryFn: () => {
        if (!activeDb || ex.id == null) throw new Error('Database not initialized');
        return activeDb.getSetsByExerciseId(ex.id);
      },
      enabled: isInitialized && !!activeDb && ex.id != null,
    })),
  });

  const selectedDateStr = formatDate(selectedDate);
  const exerciseIdsWithSetOnDate = useMemo(() => {
    const set = new Set<number>();
    setQueries.forEach((q, i) => {
      const ex = exercises[i];
      if (ex?.id == null || !q.data) return;
      const hasSetOnDate = q.data.some((s) => (s.completionDate ?? '') === selectedDateStr);
      if (hasSetOnDate) set.add(ex.id);
    });
    return set;
  }, [setQueries, exercises, selectedDateStr]);

  const setCountByExerciseId = useMemo(() => {
    const counts = new Map<number, number>();
    setQueries.forEach((q, i) => {
      const ex = exercises[i];
      if (ex?.id == null || !q.data) return;
      const count = q.data.filter((s) => (s.completionDate ?? '') === selectedDateStr).length;
      if (count > 0) counts.set(ex.id, count);
    });
    return counts;
  }, [setQueries, exercises, selectedDateStr]);

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
    <View>
      {exercises.map((exercise, i) => (
        <ExerciseListItem
          key={exercise.id}
          exercise={exercise}
          onPress={() => handlePressExercise(exercise)}
          isCompletedOnSelectedDate={exercise.id != null && exerciseIdsWithSetOnDate.has(exercise.id)}
          setCount={exercise.id != null ? setCountByExerciseId.get(exercise.id) : undefined}
        />
      ))}
    </View>
  );
}
