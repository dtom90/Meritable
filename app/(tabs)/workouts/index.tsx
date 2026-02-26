import { useRouter } from 'expo-router';
import { NarrowView } from '@/components/NarrowView';
import { useListExercises } from '@/db/useWorkoutDb';
import type { Exercise } from '@/db/habitDatabase';
import { AddExerciseForm } from '@/components/workouts/list/AddExerciseForm';
import { ExerciseList } from '@/components/workouts/list/ExerciseList';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { data: exercises = [], isLoading } = useListExercises();

  const handlePressExercise = (exercise: Exercise) => {
    if (exercise.id != null) {
      router.push(`/workouts/${exercise.id}`);
    }
  };

  return (
    <NarrowView>
      <AddExerciseForm />
      <ExerciseList
        exercises={exercises}
        isLoading={isLoading}
        onPressExercise={handlePressExercise}
      />
    </NarrowView>
  );
}
