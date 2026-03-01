import { NarrowView } from '@/components/common/NarrowView';
import { ExerciseList } from '@/components/workouts/list/ExerciseList';

export default function WorkoutsScreen() {
  return (
    <NarrowView>
      <ExerciseList />
    </NarrowView>
  );
}
