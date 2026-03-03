import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import type { Reminder } from 'expo-calendar';
import { Colors } from '@/lib/Colors';
import { Icon } from 'react-native-paper';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { useUpdateReminderCompletion } from '@/db/useReminders';

interface QuickWinsButtonProps {
  reminder: Reminder;
}

export default function QuickWinsButton({ reminder }: QuickWinsButtonProps) {
  const router = useRouter();
  const { selectedDate } = useSelectedDate();
  const updateReminderCompletion = useUpdateReminderCompletion();
  const pendingReminderId =
    updateReminderCompletion.isPending && updateReminderCompletion.variables
      ? updateReminderCompletion.variables.reminderId
      : null;

  const onMarkComplete = (r: Reminder) =>
    r.id &&
    updateReminderCompletion.mutate({
      reminderId: r.id,
      completed: true,
      selectedDate,
    });
  const onMarkIncomplete = (r: Reminder) =>
    r.id &&
    updateReminderCompletion.mutate({
      reminderId: r.id,
      completed: false,
      selectedDate,
    });

  const isCompleted = reminder.completed === true;
  const canToggle = Boolean(reminder.id);
  const canNavigate = Boolean(reminder.id);
  const isPending = Boolean(canToggle && pendingReminderId === reminder.id);
  const backgroundColor = isCompleted ? Colors.success : Colors.card;
  const icon = isCompleted ? 'restore' : 'check';
  const iconColor = isCompleted ? Colors.text : Colors.success;

  const navigateToDetail = () => {
    if (reminder.id) {
      router.push(`/quick-wins/${reminder.id}`);
    }
  };

  return (
    <View
      className="flex-row items-center my-4 rounded-lg h-[68px] overflow-hidden"
      style={{ backgroundColor, position: 'relative' }}
    >
      <TouchableOpacity
        onPress={canNavigate ? navigateToDetail : undefined}
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
            numberOfLines={1}
          >
            {reminder.title ?? 'Untitled'}
          </Text>
          {canNavigate && (
            <Icon
              source="chevron-right"
              color={isCompleted ? Colors.text : Colors.textSecondary}
              size={20}
            />
          )}
        </View>
      </TouchableOpacity>

      {canToggle ? (
        <TouchableOpacity
          onPress={() =>
            isCompleted ? onMarkIncomplete(reminder) : onMarkComplete(reminder)
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
