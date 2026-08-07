import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/common/NarrowView';
import { useExercise, useListSetsByExerciseId } from '@/db/useWorkoutDb';
import { ExerciseDetailHeader } from '@/components/workouts/detail/ExerciseDetailHeader';
import { AddSetForm } from '@/components/workouts/detail/AddSetForm';
import { SetHistoryList } from '@/components/workouts/detail/SetHistoryList';
import Spinner from '@/components/common/Spinner';

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const id = exerciseId != null ? Number(exerciseId) : NaN;
  const { data: exercise, isLoading } = useExercise(Number.isNaN(id) ? undefined : id);
  const { data: sets = [], isLoading: setsLoading } = useListSetsByExerciseId(id);

  if (isLoading) {
    return (
      <View
        className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full"
        style={{ backgroundColor: Colors.background }}
      >
        <Spinner />
      </View>
    );
  }

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
