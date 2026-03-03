import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/common/NarrowView';
import Spinner from '@/components/common/Spinner';
import { useTask, useUpdateTask } from '@/db/useTasks';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { formatDateLabel, getToday } from '@/lib/dateUtils';

export default function QuickWinDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const { selectedDate } = useSelectedDate();
  const id = taskId != null ? Number(taskId) : undefined;
  const { data: task, isLoading } = useTask(id);
  const updateTask = useUpdateTask();

  const isCompleted = task?.completed === true;
  const canToggle = Boolean(task?.id);
  const isPending = Boolean(
    canToggle &&
      updateTask.isPending &&
      updateTask.variables?.id === task?.id
  );
  const backgroundColor = isCompleted ? Colors.success : Colors.card;
  const icon = isCompleted ? 'restore' : 'check';
  const iconColor = isCompleted ? Colors.text : Colors.success;

  if (isLoading || !task) {
    return (
      <NarrowView>
        <Spinner />
      </NarrowView>
    );
  }

  const dueStr = task.dueDate;
  const completionStr = task.completionDate;

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
    <NarrowView>
      <View
        className="flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden"
        style={{ backgroundColor, position: 'relative' }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: 'transparent', zIndex: 1 }}
          className="flex-1 h-full flex flex-row items-center border-r border-gray-600"
        >
          <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
          <View className="flex-1 flex flex-row items-center justify-center">
            <Text
              className="text-lg text-center mr-1"
              style={{
                color: Colors.text,
                textDecorationLine: isCompleted ? 'line-through' : undefined,
              }}
              numberOfLines={2}
            >
              {task.title || 'Untitled'}
            </Text>
            <Icon source="chevron-right" color={isCompleted ? Colors.text : Colors.textSecondary} size={20} />
          </View>
        </TouchableOpacity>

        {canToggle && (
          <TouchableOpacity
            onPress={handleToggle}
            disabled={isPending}
            className="h-full w-16 flex items-center justify-center"
            style={{ backgroundColor: 'transparent', zIndex: 1 }}
          >
            {isPending ? (
              <Icon source="loading" color={Colors.textSecondary} size={24} />
            ) : (
              <Icon source={icon} color={iconColor} size={24} />
            )}
          </TouchableOpacity>
        )}
      </View>

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
    </NarrowView>
  );
}
