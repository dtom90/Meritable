import { View, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import { formatDateLabel } from '@/lib/dateUtils';
import type { Task } from '@/db/types';

type TaskDetailDatesProps = {
  task: Task;
};

export function TaskDetailDates({ task }: TaskDetailDatesProps) {
  const dueStr = task.dueDate;
  const completionStr = task.completionDate;
  const isCompleted = task.completed === true;

  return (
    <View className="mt-4 px-1">
      {dueStr != null && (
        <View className="mb-3">
          <Text className="text-sm" style={{ color: Colors.textSecondary }}>
            Due
          </Text>
          <Text className="text-base mt-0.5" style={{ color: Colors.text }}>
            {formatDateLabel(task.dueDate)}
          </Text>
        </View>
      )}
      {isCompleted && completionStr != null && (
        <View className="mb-3">
          <Text className="text-sm" style={{ color: Colors.textSecondary }}>
            Completed
          </Text>
          <Text className="text-base mt-0.5" style={{ color: Colors.text }}>
            {formatDateLabel(task.completionDate)}
          </Text>
        </View>
      )}
    </View>
  );
}
