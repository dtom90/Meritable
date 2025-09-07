import { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/WeekHeader';
import HabitCompletions from '@/components/HabitCompletions';
import { getToday } from '@/lib/dateUtils';


export default function HomeScreen() {
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.surface }}>

      <WeekHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate} />

      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <HabitCompletions selectedDate={selectedDate} />
      </View>

    </SafeAreaView>
  );
}
