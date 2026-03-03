import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { Task } from '@/db/types';
import { Colors } from '@/lib/Colors';
import { Icon } from 'react-native-paper';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { useUpdateTask } from '@/db/useTasks';
import { getToday } from '@/lib/dateUtils';

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
  const icon = isCompleted ? 'restore' : 'check';
  const iconColor = isCompleted ? Colors.text : Colors.success;

  const navigateToDetail = () => {
    if (task.id != null) {
      router.push(`/quick-wins/${task.id}`);
    }
  };

  return (
    <View
      className="flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden py-2"
      style={{ backgroundColor, position: 'relative' }}
    >
      <TouchableOpacity
        onPress={canNavigate ? navigateToDetail : undefined}
        style={{ backgroundColor: 'transparent', zIndex: 1 }}
        className="flex-1 h-full flex flex-row items-center border-r border-gray-600"
      >
        <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
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
      </TouchableOpacity>

      {canToggle ? (
        <TouchableOpacity
          onPress={() =>
            isCompleted ? onMarkIncomplete(task) : onMarkComplete(task)
          }
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
      ) : isCompleted ? (
        <View className="h-full w-16 flex items-center justify-center">
          <Icon source="check" color={Colors.text} size={24} />
        </View>
      ) : null}
    </View>
  );
}
