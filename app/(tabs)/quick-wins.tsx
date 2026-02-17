import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Platform, AppState, AppStateStatus } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/WeekHeader';
import { NarrowView } from '@/components/NarrowView';
import Spinner from '@/components/Spinner';
import { getToday } from '@/lib/dateUtils';
import { useQueryClient } from '@tanstack/react-query';
import {
  useRemindersPermissions,
  useQuickWinsReminders,
  quickWinsRemindersQueryKey,
} from '@/db/useReminders';
import QuickWinsList from '@/components/QuickWinsList';

export default function QuickWinsScreen() {
  const [today, setToday] = useState(getToday());
  const [selectedDate, setSelectedDate] = useState(today);
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const selectedDateRef = useRef(selectedDate);
  const todayRef = useRef(today);

  const [permission, requestPermission] = useRemindersPermissions();
  const permissionGranted = permission?.granted === true;
  const { data: reminders, isLoading } = useQuickWinsReminders(selectedDate, permissionGranted);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    todayRef.current = today;
  }, [today]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const newToday = getToday();
        if (selectedDateRef.current === todayRef.current) {
          setSelectedDate(newToday);
        }
        setToday(newToday);
        queryClient.invalidateQueries({ queryKey: quickWinsRemindersQueryKey });
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [queryClient]);

  if (Platform.OS !== 'ios') {
    return (
      <>
        <WeekHeader selectedDate={selectedDate} onDateSelect={setSelectedDate} />
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
      <WeekHeader selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <NarrowView>
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
              <QuickWinsList reminders={reminders} selectedDate={selectedDate} />
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
