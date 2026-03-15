import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { useHabit } from '@/db/useHabitDb';
import HabitTitle from '@/components/habits/detail/HabitTitle';
import HabitActions from '@/components/habits/detail/HabitActions';
import HabitCompletionsCalendar from '@/components/habits/detail/HabitCompletionsCalendar';
import { NarrowView } from '@/components/common/NarrowView';
import Spinner from '@/components/common/Spinner';

export default function HabitDetail() {
  const { habitId } = useLocalSearchParams();
  const id = habitId != null ? Number(habitId) : undefined;
  const { data: habit, isLoading } = useHabit(id);

  if (isLoading) {
    return (
      <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full" style={{ backgroundColor: Colors.background }}>
        <Spinner />
      </View>
    );
  }

  if (!habit) {
    return (
      <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full" style={{ backgroundColor: Colors.background }}>
        <Text style={{ color: Colors.text }}>Habit not found</Text>
      </View>
    );
  }

  return (
    <NarrowView>
      <HabitTitle habit={habit} />

      <HabitCompletionsCalendar habitId={habit.id} />

      <HabitActions habitId={habit.id} habit={habit} />

      <View style={{ height: 24 }} />
    </NarrowView>
  );
}
