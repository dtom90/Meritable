import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/common/NarrowView';
import Spinner from '@/components/common/Spinner';
import { useReminder, useUpdateReminderCompletion } from '@/db/useReminders';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { formatDateLabel, toDateString } from '@/lib/dateUtils';

export default function QuickWinDetailScreen() {
  const { reminderId } = useLocalSearchParams<{ reminderId: string }>();
  const router = useRouter();
  const { selectedDate } = useSelectedDate();
  const { data: reminder, isLoading } = useReminder(reminderId ?? undefined);
  const updateReminderCompletion = useUpdateReminderCompletion();

  const isCompleted = reminder?.completed === true;
  const canToggle = Boolean(reminder?.id);
  const isPending = Boolean(
    canToggle &&
      updateReminderCompletion.isPending &&
      updateReminderCompletion.variables?.reminderId === reminder?.id
  );
  const backgroundColor = isCompleted ? Colors.success : Colors.card;
  const icon = isCompleted ? 'restore' : 'check';
  const iconColor = isCompleted ? Colors.text : Colors.success;

  if (Platform.OS !== 'ios') {
    return (
      <View className="flex-1 p-5" style={{ backgroundColor: Colors.background }}>
        <Text style={{ color: Colors.textSecondary }}>Quick Win detail is available on iOS.</Text>
      </View>
    );
  }

  if (isLoading || !reminder) {
    return (
      <NarrowView>
        <Spinner />
      </NarrowView>
    );
  }

  const dueStr = toDateString(reminder.dueDate);
  const completionStr = toDateString(reminder.completionDate);
  const notes = (reminder as { notes?: string }).notes;

  const handleToggle = () => {
    if (!reminder.id) return;
    if (isCompleted) {
      updateReminderCompletion.mutate({
        reminderId: reminder.id,
        completed: false,
        selectedDate,
      });
    } else {
      updateReminderCompletion.mutate({
        reminderId: reminder.id,
        completed: true,
        selectedDate,
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
              {reminder.title ?? 'Untitled'}
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
              {formatDateLabel(reminder.dueDate)}
            </Text>
          </View>
        )}
        {isCompleted && completionStr != null && (
          <View className="mb-3">
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              Completed
            </Text>
            <Text className="text-base mt-0.5" style={{ color: Colors.text }}>
              {formatDateLabel(reminder.completionDate)}
            </Text>
          </View>
        )}
        {notes != null && String(notes).trim() !== '' && (
          <View>
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              Notes
            </Text>
            <Text className="text-base mt-0.5" style={{ color: Colors.text }}>
              {String(notes).trim()}
            </Text>
          </View>
        )}
      </View>
    </NarrowView>
  );
}
