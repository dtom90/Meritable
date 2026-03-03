import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NarrowView } from '@/components/common/NarrowView';
import { BackButton } from '@/components/common/BackButton';
import Spinner from '@/components/common/Spinner';
import { useTask } from '@/db/useTasks';
import { TaskDetailHeader } from '@/components/quick-wins/detail/TaskDetailHeader';
import { TaskDetailDates } from '@/components/quick-wins/detail/TaskDetailDates';
import { TaskDetailTags } from '@/components/quick-wins/detail/TaskDetailTags';

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
      <View className="flex-row items-center mb-4">
        <BackButton />
      </View>
      <TaskDetailHeader task={task} />
      <TaskDetailDates task={task} />
      {task.id != null && <TaskDetailTags taskId={task.id} />}
    </NarrowView>
  );
}
