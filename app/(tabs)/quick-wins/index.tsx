import { useState } from 'react';
import WeekHeader from '@/components/common/WeekHeader';
import { NarrowView } from '@/components/common/NarrowView';
import QuickWinsList from '@/components/quick-wins/list/QuickWinsList';
import AddTaskButton from '@/components/quick-wins/list/AddTaskButton';

export default function QuickWinsScreen() {
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  return (
    <>
      <WeekHeader />
      <NarrowView>
        <QuickWinsList
          selectedTagId={selectedTagId}
          onSelectTagId={setSelectedTagId}
        />
        <AddTaskButton />
      </NarrowView>
    </>
  );
}
