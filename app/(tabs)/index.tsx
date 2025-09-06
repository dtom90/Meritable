import { useState } from 'react';
import { View } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/WeekHeader';
import HabitCompletions from '@/components/HabitCompletions';
import { getToday } from '@/lib/dateUtils';


export default function HomeScreen() {
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: Colors.background }}>

      <WeekHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate} />

      <HabitCompletions selectedDate={selectedDate} />

    </View>
  );
}
