import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { Colors } from '@/lib/Colors';
import { useListHabits, useListHabitCompletionsByDate } from '@/db/useHabitDb';
import { HabitCompletion } from '@/db/types';
import useWindowWidth from '@/lib/useWindowWidth';
import AddHabitButton from '@/components/AddHabitButton';
import HabitCompletionButton from './HabitCompletionButton';
import HabitInputModal from './HabitInputModal';


interface HabitCompletionsProps {
  selectedDate: string;
}

const widthThreshold = 950;

export default function HabitCompletions({ selectedDate }: HabitCompletionsProps) {
  const width = useWindowWidth();
  const [modalVisible, setModalVisible] = useState(false);
  
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
    <>
      {habits.length === 0 && (
        <TouchableOpacity
          className="rounded-lg p-4 m-8 justify-center items-center shadow-lg"
          style={{ backgroundColor: Colors.primary }}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text className="text-xl font-medium" style={{ color: Colors.text }}>Add Habit</Text>
        </TouchableOpacity>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="max-w-3xl self-center w-full my-4">
          {habits.map(habit => (
            <HabitCompletionButton 
              key={habit.id} 
              habit={habit} 
              selectedDate={selectedDate} 
              habitCompletionsMap={habitCompletionsMap}
            />
          ))}
          {habits.length > 0 && width < widthThreshold && (
            <AddHabitButton withTooltip={false} />
          )}
        </View>
      </ScrollView>

      {habits.length > 0 && width >= widthThreshold && (
        <AddHabitButton withTooltip={true} />
      )}
      
      <HabitInputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add New Habit"
      />
    </>
  );
}
