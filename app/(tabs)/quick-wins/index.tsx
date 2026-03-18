import WeekHeader from '@/components/common/WeekHeader';
import { NarrowView } from '@/components/common/NarrowView';
import QuickWinsList from '@/components/quick-wins/list/QuickWinsList';
import AddTaskButton from '@/components/quick-wins/list/AddTaskButton';
import { useTasksForDate } from '@/db/useTasks';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { useState } from 'react';

export default function QuickWinsScreen() {
  const { selectedDate } = useSelectedDate();
  const { refetch, isFetching } = useTasksForDate(selectedDate);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  return (
    <>
      <WeekHeader />
      <NarrowView refreshing={isFetching} onRefresh={() => { void refetch(); }}>
        <QuickWinsList selectedTagId={selectedTagId} onSelectTagId={setSelectedTagId} />
        <AddTaskButton initialTagId={selectedTagId} />
      </NarrowView>
    </>
  );
}
