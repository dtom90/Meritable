import { NarrowView } from '@/components/NarrowView';
import { AddExerciseForm } from '@/components/workouts/list/AddExerciseForm';
import { ExerciseList } from '@/components/workouts/list/ExerciseList';

export default function WorkoutsScreen() {
  return (
    <NarrowView>
      <AddExerciseForm />
      <ExerciseList />
    </NarrowView>
  );
}
