import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useListHabits } from '@/db/useHabitDb';
import useWindowWidth from '@/hooks/useWindowWidth';
import AddHabitButton from '@/components/AddHabitButton';
import HabitCompletionButton from './HabitCompletionButton';


interface HabitCompletionsProps {
  selectedDate: string;
}

const widthThreshold = 950;

export default function HabitCompletions({ selectedDate }: HabitCompletionsProps) {
  const router = useRouter();
  const width = useWindowWidth();
  
  const { data: habits = [], isLoading: isLoadingHabits } = useListHabits();
  
  if (isLoadingHabits) {
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
          onPress={() => router.push('/habits?focusInput=true')}
          activeOpacity={0.8}
        >
          <Text className="text-xl font-medium" style={{ color: Colors.text }}>Add Habit</Text>
        </TouchableOpacity>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="max-w-3xl self-center w-full my-4">
          {habits.map(habit => (
            <HabitCompletionButton habit={habit} selectedDate={selectedDate} />
          ))}
          {habits.length && width < widthThreshold && (
            <AddHabitButton withTooltip={false} />
          )}
        </View>
      </ScrollView>

      {habits.length && width >= widthThreshold && (
        <AddHabitButton withTooltip={true} />
      )}
    </>
  );
}
