import WeekHeader from '@/components/common/WeekHeader';
import { NarrowView } from '@/components/common/NarrowView';
import QuickWinsList from '@/components/quick-wins/list/QuickWinsList';
import AddTaskButton from '@/components/quick-wins/list/AddTaskButton';
import { useTasksForDate } from '@/db/useTasks';
import { useSelectedDate } from '@/lib/selectedDateStore';

export default function QuickWinsScreen() {
  const { selectedDate } = useSelectedDate();
  const { refetch, isFetching } = useTasksForDate(selectedDate);

  return (
    <>
      <WeekHeader />
      <NarrowView refreshing={isFetching} onRefresh={() => { void refetch(); }}>
        <QuickWinsList />
        <AddTaskButton />
      </NarrowView>
    </>
  );
}
