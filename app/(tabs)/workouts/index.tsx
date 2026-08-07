import { View } from 'react-native';
import { ExerciseList } from '@/components/workouts/list/ExerciseList';
import WeekHeader from '@/components/common/WeekHeader';

export default function WorkoutsScreen() {
  return (
    <View className="flex-1">
      <WeekHeader />
      <ExerciseList />
    </View>
  );
}
