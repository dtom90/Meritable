import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import Spinner from '@/components/Spinner';
import { ExerciseListItem } from './ExerciseListItem';
import type { Exercise } from '@/db/habitDatabase';

type ExerciseListProps = {
  exercises: Exercise[];
  isLoading: boolean;
  onPressExercise: (exercise: Exercise) => void;
};

export function ExerciseList({
  exercises,
  isLoading,
  onPressExercise,
}: ExerciseListProps) {
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
          onPress={() => onPressExercise(exercise)}
        />
      ))}
    </View>
  );
}
