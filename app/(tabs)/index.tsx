import { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import DaysHeader, { tabs } from '@/components/DaysHeader';
import HabitCompletions from '@/components/HabitCompletions';


export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [selectedDate, setSelectedDate] = useState(tabs[tabs.length - 1]);

  useFocusEffect(
    useCallback(() => {
      if (params.today) {
        setSelectedDate(tabs[tabs.length - 1]);
        router.replace('/');
      }
    }, [params])
  );

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <DaysHeader selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      <HabitCompletions selectedDate={selectedDate} />
    </View>
  );
}
