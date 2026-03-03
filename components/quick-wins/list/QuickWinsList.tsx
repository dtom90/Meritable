import { View } from 'react-native';
import Spinner from '@/components/common/Spinner';
import QuickWinsButton from './QuickWinsButton';
import { useTasksForDate } from '@/db/useTasks';
import { useSelectedDate } from '@/lib/selectedDateStore';

export default function QuickWinsList() {
  const { selectedDate } = useSelectedDate();
  const { data: tasks, isLoading } = useTasksForDate(selectedDate);

  if (isLoading) {
    return <Spinner />;
  }

  if (tasks && tasks.length > 0) {
    return (
      <View>
        {tasks.map((task, index) => (
          <QuickWinsButton
            key={task.id ?? `task-${index}`}
            task={task}
          />
        ))}
      </View>
    );
  }

  return <View></View>
}
