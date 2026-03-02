import { Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import Spinner from '@/components/common/Spinner';
import QuickWinsList from '@/components/quick-wins/QuickWinsList';
import { useSelectedDate } from '@/lib/selectedDateStore';
import {
  useRemindersPermissions,
  useQuickWinsReminders,
  useUpdateReminderCompletion,
} from '@/db/useReminders';
import type { Reminder } from 'expo-calendar';

export default function RemindersContent() {
  const { selectedDate } = useSelectedDate();
  const [permission] = useRemindersPermissions();
  const permissionGranted = permission?.granted === true;
  const { data: reminders, isLoading } = useQuickWinsReminders(selectedDate, permissionGranted);
  const updateReminderCompletion = useUpdateReminderCompletion();
  const pendingReminderId =
    updateReminderCompletion.isPending && updateReminderCompletion.variables
      ? updateReminderCompletion.variables.reminderId
      : null;

  if (isLoading) {
    return <Spinner />;
  }

  if (reminders && reminders.length > 0) {
    return (
      <QuickWinsList
        reminders={reminders}
        selectedDate={selectedDate}
        onMarkComplete={(r: Reminder) => r.id && updateReminderCompletion.mutate({ reminderId: r.id, completed: true })}
        onMarkIncomplete={(r: Reminder) => r.id && updateReminderCompletion.mutate({ reminderId: r.id, completed: false })}
        pendingReminderId={pendingReminderId}
      />
    );
  }

  return (
    <Text style={{ color: Colors.textSecondary }}>
      No dated reminders for this day.
    </Text>
  );
}
