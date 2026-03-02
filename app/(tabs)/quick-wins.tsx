import { View, Text, Pressable, Platform, Linking } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/common/WeekHeader';
import { NarrowView } from '@/components/common/NarrowView';
import Spinner from '@/components/common/Spinner';
import { useSelectedDate } from '@/lib/selectedDateStore';
import {
  useRemindersPermissions,
  useQuickWinsReminders,
  useUpdateReminderCompletion,
} from '@/db/useReminders';
import QuickWinsList from '@/components/quick-wins/QuickWinsList';
import { Icon } from 'react-native-paper';
import type { Reminder } from 'expo-calendar';

export default function QuickWinsScreen() {
  const { selectedDate } = useSelectedDate();

  const [permission, requestPermission] = useRemindersPermissions();
  const permissionGranted = permission?.granted === true;
  const { data: reminders, isLoading } = useQuickWinsReminders(selectedDate, permissionGranted);
  const updateReminderCompletion = useUpdateReminderCompletion();
  const pendingReminderId =
    updateReminderCompletion.isPending && updateReminderCompletion.variables
      ? updateReminderCompletion.variables.reminderId
      : null;

  const openRemindersApp = () => {
    Linking.openURL('x-apple-reminderkit://');
  };

  if (Platform.OS !== 'ios') {
    return (
      <>
        <WeekHeader />
        <NarrowView disableScroll>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>
              Quick Wins is available on iOS.
            </Text>
          </View>
        </NarrowView>
      </>
    );
  }

  return (
    <>
      <WeekHeader />
      <NarrowView>
        {permissionGranted && (
          <Pressable
            onPress={openRemindersApp}
            className="flex-row items-center gap-2 py-2 mb-2"
            style={{ alignSelf: 'flex-start' }}
          >
            <Icon source="open-in-new" size={20} color={Colors.primary} />
            <Text style={{ color: Colors.primary, fontWeight: '500' }}>
              Open Reminders
            </Text>
          </Pressable>
        )}
        {!permission?.granted && permission?.canAskAgain !== false && (
          <View className="mb-4">
            <Text style={{ color: Colors.text, marginBottom: 8 }}>
              Grant access to Reminders to see your dated reminders for the selected day.
            </Text>
            <Pressable
              onPress={() => requestPermission()}
              style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: Colors.primary, borderRadius: 8, alignSelf: 'flex-start' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Allow access</Text>
            </Pressable>
          </View>
        )}
        {!permission?.granted && permission?.canAskAgain === false && (
          <Text style={{ color: Colors.textSecondary }}>
            Reminders access was denied. You can enable it in Settings.
          </Text>
        )}
        {permissionGranted && (
          <>
            {isLoading ? (
              <Spinner />
            ) : reminders && reminders.length > 0 ? (
              <QuickWinsList
                reminders={reminders}
                selectedDate={selectedDate}
                onMarkComplete={(r: Reminder) => r.id && updateReminderCompletion.mutate({ reminderId: r.id, completed: true })}
                onMarkIncomplete={(r: Reminder) => r.id && updateReminderCompletion.mutate({ reminderId: r.id, completed: false })}
                pendingReminderId={pendingReminderId}
              />
            ) : (
              <Text style={{ color: Colors.textSecondary }}>
                No dated reminders for this day.
              </Text>
            )}
          </>
        )}
      </NarrowView>
    </>
  );
}
