import { View, Text } from 'react-native';
import { useMemo } from 'react';
import { Colors } from '@/lib/Colors';
import { useListHabits, useListHabitCompletionsByDate } from '@/db/useHabitDb';
import { HabitCompletion } from '@/db/types';
import HabitCompletionButton from './HabitCompletionButton';

interface HabitCompletionsProps {
  selectedDate: string;
}

export default function HabitCompletions({ selectedDate }: HabitCompletionsProps) {
  const { data: habits = [], isLoading: isLoadingHabits } = useListHabits();
  const { data: completions = [], isLoading: isLoadingCompletions } = useListHabitCompletionsByDate(selectedDate);
  
  const habitCompletionsMap = useMemo(() => {
    return completions.reduce((acc, completion) => {
      acc[completion.habitId] = completion;
      return acc;
    }, {} as Record<number, HabitCompletion>);
  }, [completions]);
  
  if (isLoadingHabits || isLoadingCompletions) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: Colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View>
      {habits.map(habit => (
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
