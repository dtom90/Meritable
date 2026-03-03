import { useLocalSearchParams } from 'expo-router';
import { NarrowView } from '@/components/common/NarrowView';
import Spinner from '@/components/common/Spinner';
import { useTask } from '@/db/useTasks';
import { TaskDetailHeader } from '@/components/quick-wins/detail/TaskDetailHeader';
import { TaskDetailDates } from '@/components/quick-wins/detail/TaskDetailDates';

export default function QuickWinDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const id = taskId != null ? Number(taskId) : undefined;
  const { data: task, isLoading } = useTask(id);

  if (isLoading || !task) {
    return (
      <NarrowView>
        <Spinner />
      </NarrowView>
    );
  }

  return (
    <NarrowView>
      <TaskDetailHeader task={task} />
      <TaskDetailDates task={task} />
    </NarrowView>
  );
}
