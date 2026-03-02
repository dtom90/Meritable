import WeekHeader from '@/components/common/WeekHeader';
import HabitCompletionsList from '@/components/habits/list/HabitCompletionsList';
import { useSelectedDate } from '@/lib/selectedDateStore';

export default function HomeScreen() {
  const { selectedDate } = useSelectedDate();

  return (
    <>
      <WeekHeader />
      <HabitCompletionsList selectedDate={selectedDate} />
    </>
  );
}
