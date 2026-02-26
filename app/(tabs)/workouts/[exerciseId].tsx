import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/NarrowView';
import { useListExercises, useListSetsByExerciseId } from '@/db/useWorkoutDb';
import { ExerciseDetailHeader } from '@/components/workouts/detail/ExerciseDetailHeader';
import { AddSetForm } from '@/components/workouts/detail/AddSetForm';
import { SetHistoryList } from '@/components/workouts/detail/SetHistoryList';

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const id = exerciseId != null ? Number(exerciseId) : NaN;
  const { data: exercises = [] } = useListExercises();
  const { data: sets = [], isLoading: setsLoading } = useListSetsByExerciseId(id);

  const exercise = exercises.find((e) => e.id === id);

  if (!exercise) {
    return (
      <View
        className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full"
        style={{ backgroundColor: Colors.background }}
      >
        <Text style={{ color: Colors.text }}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <NarrowView>
      <ExerciseDetailHeader title={exercise.name} />

      <AddSetForm exerciseId={id} />

      <SetHistoryList sets={sets} isLoading={setsLoading} />
    </NarrowView>
  );
}
