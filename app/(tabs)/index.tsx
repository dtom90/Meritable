import { useState } from 'react';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import DaysHeader from '@/components/DaysHeader';
import HabitCompletions from '@/components/HabitCompletions';
import { getToday } from '@/utils/dateUtils';


export default function HomeScreen() {
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <DaysHeader selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      <HabitCompletions selectedDate={selectedDate} />
    </View>
  );
}
