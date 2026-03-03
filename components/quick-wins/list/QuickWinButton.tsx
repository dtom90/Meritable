import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import type { Task } from '@/db/types';
import { Colors } from '@/lib/Colors';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { useUpdateTask } from '@/db/useTasks';
import { getToday } from '@/lib/dateUtils';
import PillButton from '@/components/common/PillButton';

interface QuickWinButtonProps {
  task: Task;
  tagNames?: string[];
}

export default function QuickWinButton({ task, tagNames = [] }: QuickWinButtonProps) {
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

  const navigateToDetail = () => {
    if (task.id != null) {
      router.push(`/quick-wins/${task.id}`);
    }
  };

  return (
    <PillButton
      text={task.title || 'Untitled'}
      highlightAsCompleted={isCompleted}
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
      {tagNames.length > 0 ? (
        <View className="flex-row flex-wrap justify-center gap-1">
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
      ) : null}
    </PillButton>
  );
}
