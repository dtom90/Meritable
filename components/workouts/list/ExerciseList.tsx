import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import Spinner from '@/components/Spinner';
import { useListExercises } from '@/db/useWorkoutDb';
import { ExerciseListItem } from './ExerciseListItem';
import type { Exercise } from '@/db/types';

export function ExerciseList() {
  const router = useRouter();
  const { data: exercises = [], isLoading } = useListExercises();

  const handlePressExercise = (exercise: Exercise) => {
    if (exercise.id != null) {
      router.push(`/workouts/${exercise.id}`);
    }
  };
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
