import { View, Text, TouchableOpacity } from 'react-native';
import type { Reminder } from 'expo-calendar';
import { Colors } from '@/lib/Colors';
import { Icon } from 'react-native-paper';

function toDateString(value: string | Date | undefined): string | null {
  if (value == null) return null;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('sv-SE');
}

interface QuickWinsListProps {
  reminders: Reminder[];
  selectedDate: string;
  onMarkComplete?: (reminder: Reminder) => void;
  onMarkIncomplete?: (reminder: Reminder) => void;
  pendingReminderId?: string | null;
}

export default function QuickWinsList({
  reminders,
  selectedDate,
  onMarkComplete,
  onMarkIncomplete,
  pendingReminderId = null,
}: QuickWinsListProps) {
  return (
    <View>
      {reminders.map((reminder, index) => {
        const isCompleted = reminder.completed === true;
        const dueStr = toDateString(reminder.dueDate);
        const completionStr = toDateString(reminder.completionDate);
        const subtitle = isCompleted && completionStr
          ? `Completed ${completionStr}`
          : dueStr
            ? `Due ${dueStr}`
            : null;

        const canToggle =
          reminder.id && (onMarkComplete != null || onMarkIncomplete != null);
        const isPending = Boolean(
          canToggle && pendingReminderId === reminder.id
        );

        return (
          <View
            key={reminder.id ?? `reminder-${index}`}
            className="flex-row items-center my-4 rounded-lg min-h-[68px] px-4"
            style={{ backgroundColor: isCompleted ? Colors.success : Colors.card }}
          >
            <View className="flex-1">
              <Text
                className="text-lg"
                style={{
                  color: Colors.text,
                  textDecorationLine: isCompleted ? 'line-through' : undefined,
                }}
                numberOfLines={2}
              >
                {reminder.title ?? 'Untitled'}
              </Text>
              {subtitle && (
                <Text
                  className="text-sm mt-0.5"
                  style={{ color: Colors.textSecondary }}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            {canToggle ? (
              <TouchableOpacity
                onPress={() =>
                  isCompleted
                    ? onMarkIncomplete?.(reminder)
                    : onMarkComplete?.(reminder)
                }
                disabled={isPending}
                className="p-2"
              >
                {isPending ? (
                  <Icon source="loading" color={Colors.textSecondary} size={24} />
                ) : isCompleted ? (
                  <Icon source="restore" color={Colors.text} size={24} />
                ) : (
                  <Icon source="check" color={Colors.success} size={24} />
                )}
              </TouchableOpacity>
            ) : isCompleted ? (
              <Icon source="check" color={Colors.text} size={24} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
