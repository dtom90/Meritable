import { View } from 'react-native';
import type { Task } from '@/db/types';
import QuickWinButton from './QuickWinButton';

type QuickWinsTaskListProps = {
  tasks: Task[] | null | undefined;
  getTaskTags: (taskId: number) => { names: string[]; ids: number[] };
  selectedTagId: number | null;
};

export default function QuickWinsTaskList({
  tasks,
  getTaskTags,
  selectedTagId,
}: QuickWinsTaskListProps) {
  if (!tasks || tasks.length === 0) {
    return <View />;
  }

  return (
    <>
      {tasks.map((task, index) => (
        <QuickWinButton
          key={task.id ?? `task-${index}`}
          task={task}
          taskTags={
            task.id != null ? getTaskTags(task.id) : { names: [], ids: [] }
          }
          selectedTagId={selectedTagId}
        />
      ))}
    </>
  );
}
