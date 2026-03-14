import PillButton from '@/components/common/PillButton';
import { useUpdateTask } from '@/db/useTasks';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { getToday } from '@/lib/dateUtils';
import type { Task } from '@/db/types';

type TaskDetailHeaderProps = {
  task: Task;
  onOpenEdit: () => void;
};

export function TaskDetailHeader({ task, onOpenEdit }: TaskDetailHeaderProps) {
  const { selectedDate } = useSelectedDate();
  const updateTask = useUpdateTask();

  const isCompleted = task.completed === true;
  const canToggle = Boolean(task.id);
  const isPending = Boolean(
    canToggle &&
      updateTask.isPending &&
      updateTask.variables?.id === task.id
  );

  const handleToggle = () => {
    if (task.id == null) return;
    if (isCompleted) {
      updateTask.mutate({
        id: task.id,
        updates: { completed: false, completionDate: null },
      });
    } else {
      const completionDate = selectedDate === getToday() ? getToday() : selectedDate;
      updateTask.mutate({
        id: task.id,
        updates: { completed: true, completionDate },
      });
    }
  };

  return (
    <>
      <PillButton
        text={task.title || 'Untitled'}
        highlightAsCompleted={isCompleted}
        onMainPress={onOpenEdit}
        rightIcon="pencil"
        checkButton={
          canToggle
            ? {
                onPress: handleToggle,
                disabled: isPending,
                loading: isPending,
                completed: isCompleted,
              }
            : undefined
        }
      />
    </>
  );
}
