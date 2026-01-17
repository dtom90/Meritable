import { View, Text } from 'react-native';
import { useMemo } from 'react';
import { Colors } from '@/lib/Colors';
import { useListHabitCompletionsByDate } from '@/db/useHabitDb';
import { Habit, HabitCompletion } from '@/db/habitDatabase';
import HabitCompletionButton from './HabitCompletionButton';
import Spinner from './Spinner';

interface HabitCompletionsProps {
  selectedDate: string;
  habits: Habit[];
}

export default function HabitCompletions({ selectedDate, habits }: HabitCompletionsProps) {
  const { data: completions, isLoading: isLoadingCompletions } = useListHabitCompletionsByDate(selectedDate);
  
  const habitCompletionsMap = useMemo(() => {
    if (!completions) return {};
    return completions.reduce((acc, completion) => {
      acc[completion.habitId] = completion;
      return acc;
    }, {} as Record<number, HabitCompletion>);
  }, [completions]);
  
  if (isLoadingCompletions) {
    return <Spinner />;
  }

  return (
    <View>
      {habits && habits.length > 0 && habits.map(habit => (
        <HabitCompletionButton 
          key={habit.id} 
          habit={habit} 
          selectedDate={selectedDate} 
          habitCompletionsMap={habitCompletionsMap}
        />
      ))}
    </View>
  );
}
