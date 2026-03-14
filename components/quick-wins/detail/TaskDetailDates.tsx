import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { formatDateLabel } from '@/lib/dateUtils';
import type { Task } from '@/db/types';

type TaskDetailDatesProps = {
  task: Task;
  onOpenEdit: () => void;
};

export function TaskDetailDates({ task, onOpenEdit }: TaskDetailDatesProps) {
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
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-base" style={{ color: Colors.text }}>
              {formatDateLabel(task.dueDate)}
            </Text>
            <TouchableOpacity
              onPress={onOpenEdit}
              className="p-2 rounded-full"
              style={{ backgroundColor: Colors.border }}
              accessibilityLabel="Edit date"
            >
              <Icon source="pencil" color={Colors.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isCompleted && completionStr != null && (
        <View className="mb-3">
          <Text className="text-sm" style={{ color: Colors.textSecondary }}>
            Completed
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-base" style={{ color: Colors.text }}>
              {formatDateLabel(task.completionDate)}
            </Text>
            <TouchableOpacity
              onPress={onOpenEdit}
              className="p-2 rounded-full"
              style={{ backgroundColor: Colors.border }}
              accessibilityLabel="Edit date"
            >
              <Icon source="pencil" color={Colors.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
