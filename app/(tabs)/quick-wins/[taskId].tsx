import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NarrowView } from '@/components/common/NarrowView';
import { BackButton } from '@/components/common/BackButton';
import Spinner from '@/components/common/Spinner';
import { useTask } from '@/db/useTasks';
import EditTaskModal from '@/components/quick-wins/list/EditTaskModal';
import { TaskDetailHeader } from '@/components/quick-wins/detail/TaskDetailHeader';
import { TaskDetailDates } from '@/components/quick-wins/detail/TaskDetailDates';
import { TaskDetailTags } from '@/components/quick-wins/detail/TaskDetailTags';
import DeleteTaskButton from '@/components/quick-wins/detail/DeleteTaskButton';

export default function QuickWinDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const id = taskId != null ? Number(taskId) : undefined;
  const { data: task, isLoading } = useTask(id);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFocusField, setEditFocusField] = useState<'title' | 'date'>('title');

  const openEditModal = (focusField: 'title' | 'date' = 'title') => {
    setEditFocusField(focusField);
    setEditModalVisible(true);
  };

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
      <TaskDetailHeader task={task} onOpenEdit={() => openEditModal('title')} />
      <TaskDetailDates
        task={task}
        onOpenEdit={() => openEditModal('date')}
      />
      {task.id != null && <TaskDetailTags taskId={task.id} />}
      {task.id != null && (
        <View className="mt-12">
          <DeleteTaskButton taskId={task.id} />
        </View>
      )}
      <EditTaskModal
        task={task}
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        focusField={editFocusField}
      />
    </NarrowView>
  );
}
