import { View, Text } from 'react-native';
import type { Reminder } from 'expo-calendar';
import { Colors } from '@/lib/Colors';
import Spinner from '@/components/common/Spinner';
import QuickWinsButton from './QuickWinsButton';
import {
  useRemindersPermissions,
  useQuickWinsReminders,
} from '@/db/useReminders';
import { useSelectedDate } from '@/lib/selectedDateStore';

export default function QuickWinsList() {
  const { selectedDate } = useSelectedDate();
  const [permission] = useRemindersPermissions();
  const permissionGranted = permission?.granted === true;
  const { data: reminders, isLoading } = useQuickWinsReminders(selectedDate, permissionGranted);

  if (isLoading) {
    return <Spinner />;
  }

  if (reminders && reminders.length > 0) {
    return (
      <View>
        {reminders.map((reminder: Reminder, index: number) => (
          <QuickWinsButton
            key={reminder.id ?? `reminder-${index}`}
            reminder={reminder}
          />
        ))}
      </View>
    );
  }

  return (
    <Text style={{ color: Colors.textSecondary }}>
      No dated reminders for this day.
    </Text>
  );
}
