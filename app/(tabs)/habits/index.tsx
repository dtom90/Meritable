import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import WeekHeader from '@/components/WeekHeader';
import HabitCompletionsList from '@/components/HabitCompletionsList';
import { getToday } from '@/lib/dateUtils';
import { useQueryClient } from '@tanstack/react-query';

export default function HomeScreen() {
  const [today, setToday] = useState(getToday());
  const [selectedDate, setSelectedDate] = useState(today);
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const selectedDateRef = useRef(selectedDate);
  const todayRef = useRef(today);

  // Keep refs in sync with state
  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    todayRef.current = today;
  }, [today]);

  // Listen for app state changes and refetch data when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, recalculate today and invalidate queries
        const newToday = getToday();
        const oldToday = todayRef.current;
        // If selectedDate was set to the old today, update it to the new today
        if (selectedDateRef.current === oldToday) {
          setSelectedDate(newToday);
        }
        setToday(newToday);
        queryClient.invalidateQueries();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [queryClient]);

  return (
    <>
      <WeekHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate} />
      
      <HabitCompletionsList selectedDate={selectedDate} />
    </>
  );
}
