import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { Task } from '@/db/types';
import { Colors } from '@/lib/Colors';
import { Icon } from 'react-native-paper';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { useUpdateTask } from '@/db/useTasks';
import { getToday } from '@/lib/dateUtils';
import PillButton from '@/components/common/PillButton';

interface QuickWinsButtonProps {
  task: Task;
  tagNames?: string[];
}

export default function QuickWinsButton({ task, tagNames = [] }: QuickWinsButtonProps) {
  const router = useRouter();
  const { selectedDate } = useSelectedDate();
  const updateTask = useUpdateTask();
  const pendingId =
    updateTask.isPending && updateTask.variables ? updateTask.variables.id : null;

  const onMarkComplete = (t: Task) => {
    if (t.id == null) return;
    const completionDate = selectedDate === getToday() ? getToday() : selectedDate;
    updateTask.mutate({ id: t.id, updates: { completed: true, completionDate } });
  };
  const onMarkIncomplete = (t: Task) => {
    if (t.id == null) return;
    updateTask.mutate({ id: t.id, updates: { completed: false, completionDate: null } });
  };

  const isCompleted = task.completed === true;
  const canToggle = Boolean(task.id);
  const canNavigate = Boolean(task.id);
  const isPending = Boolean(canToggle && pendingId === task.id);
  const backgroundColor = isCompleted ? Colors.success : Colors.card;

  const navigateToDetail = () => {
    if (task.id != null) {
      router.push(`/quick-wins/${task.id}`);
    }
  };

  return (
    <PillButton
      backgroundColor={backgroundColor}
      onMainPress={canNavigate ? navigateToDetail : undefined}
      checkButton={
        canToggle
          ? {
              onPress: () => (isCompleted ? onMarkIncomplete(task) : onMarkComplete(task)),
              disabled: isPending,
              loading: isPending,
              completed: isCompleted,
            }
          : isCompleted
            ? { onPress: () => {}, disabled: true, loading: false, completed: true }
            : undefined
      }
    >
      <View className="flex-1 flex flex-col items-center justify-center">
        <View className="flex-row items-center">
          <Text
            className="text-lg text-center mr-1"
            style={{
              color: Colors.text,
              textDecorationLine: isCompleted ? 'line-through' : undefined,
            }}
            numberOfLines={1}
          >
            {task.title || 'Untitled'}
          </Text>
          {canNavigate && (
            <Icon
              source="chevron-right"
              color={isCompleted ? Colors.text : Colors.textSecondary}
              size={20}
            />
          )}
        </View>
        {tagNames.length > 0 && (
          <View className="flex-row flex-wrap justify-center gap-1 mt-1">
            {tagNames.slice(0, 3).map((name) => (
              <View
                key={name}
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: Colors.border }}
              >
                <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                  {name}
                </Text>
              </View>
            ))}
            {tagNames.length > 3 && (
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: Colors.border }}
              >
                <Text className="text-xs" style={{ color: Colors.textSecondary }}>
                  +{tagNames.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </PillButton>
  );
}
