import { View, Text, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { useListHabits } from '@/db/useHabitDb';
import HabitTitle from '@/components/HabitTitle'
import HabitActions from '@/components/HabitActions'
import HabitCompletionsCalendar from '@/components/HabitCompletionsCalendar'
import { NarrowView } from '@/components/NarrowView';


export default function HabitDetail() {
  const { habitId } = useLocalSearchParams();
  const { data: habits = [] } = useListHabits();
  const habit = habits.find(h => h.id === Number(habitId));
  
  if (!habit) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
        <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
          <Text style={{ color: Colors.text }}>Habit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NarrowView>
      <HabitTitle habit={habit} />

      <HabitCompletionsCalendar habitId={habit.id} />

      <HabitActions habitId={habit.id} />

      <View style={{ height: 24 }} />
    </NarrowView>
  );
}
