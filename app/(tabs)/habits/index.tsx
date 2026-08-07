import { View } from 'react-native';
import WeekHeader from '@/components/common/WeekHeader';
import HabitCompletionsList from '@/components/habits/list/HabitCompletionsList';
import { useSelectedDate } from '@/lib/selectedDateStore';

export default function HomeScreen() {
  const { selectedDate } = useSelectedDate();

  return (
    <View className="flex-1">
      <WeekHeader />
      <HabitCompletionsList selectedDate={selectedDate} />
    </View>
  );
}
