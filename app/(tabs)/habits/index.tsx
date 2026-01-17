import { useState, useEffect, useRef } from 'react';
import { View, Pressable, Text, AppState, AppStateStatus } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/WeekHeader';
import HabitCompletions from '@/components/HabitCompletions';
import { getToday } from '@/lib/dateUtils';
import HabitReorderList from '@/components/HabitReorderList';
import { NarrowView } from '@/components/NarrowView';
import AddHabitButton from '@/components/AddHabitButton';
import { useQueryClient } from '@tanstack/react-query';
import { useListHabits } from '@/db/useHabitDb';
import Spinner from '@/components/Spinner';


export default function HomeScreen() {
  const [today, setToday] = useState(getToday());
  const [selectedDate, setSelectedDate] = useState(today);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const selectedDateRef = useRef(selectedDate);
  const todayRef = useRef(today);
  const { data: habits, isLoading: isLoadingHabits } = useListHabits();

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
      
      <NarrowView disableScroll={isEditing}>

        {habits && habits.length > 1 && (
          <View className='flex-row justify-between items-center'>
            <Pressable onPress={() => setIsEditing(!isEditing)}>
              <Text style={{ color: Colors.primary }}>{isEditing ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>
        )}

        {isLoadingHabits ? (
          <Spinner />
        ) : isEditing ? (
          <View className="flex-1">
            <HabitReorderList />
          </View>
        ) : (habits && habits.length > 0 && (
          <HabitCompletions selectedDate={selectedDate} habits={habits} />
        ))}

        <AddHabitButton withTooltip={false} />

      </NarrowView>
    </>
  );
}
