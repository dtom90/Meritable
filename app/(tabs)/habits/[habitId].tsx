import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useListHabits } from '@/db/useHabitDb';
import HabitTitle from '@/components/HabitTitle'
import HabitActions from '@/components/HabitActions'
import HabitCompletionsCalendar from '@/components/HabitCompletionsCalendar'


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
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-[50px] px-5 max-w-[800px] self-center w-full">
          <HabitTitle habit={habit} />

          <HabitCompletionsCalendar habitId={habit.id} />

          <HabitActions habitId={habit.id} />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
