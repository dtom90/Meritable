import { ExerciseList } from '@/components/workouts/list/ExerciseList';
import WeekHeader from '@/components/common/WeekHeader';

export default function WorkoutsScreen() {
  return (
      <>
        <WeekHeader />
        <ExerciseList />
      </>
  );
}
