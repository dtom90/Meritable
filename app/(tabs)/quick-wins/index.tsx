import WeekHeader from '@/components/common/WeekHeader';
import { NarrowView } from '@/components/common/NarrowView';
import QuickWinsList from '@/components/quick-wins/QuickWinsList';
import AddTaskButton from '@/components/quick-wins/AddTaskButton';

export default function QuickWinsScreen() {
  return (
    <>
      <WeekHeader />
      <NarrowView>
        <QuickWinsList />
        <AddTaskButton />
      </NarrowView>
    </>
  );
}
