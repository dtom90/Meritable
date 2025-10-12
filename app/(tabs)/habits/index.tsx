import { useState } from 'react';
import { SafeAreaView, View, Pressable, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/WeekHeader';
import HabitCompletions from '@/components/HabitCompletions';
import { getToday } from '@/lib/dateUtils';
import HabitReorderList from '@/components/HabitReorderList';


export default function HomeScreen() {
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: Colors.surface }}>

      <WeekHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate} />
      
        <View style={{ flex: 1, backgroundColor: Colors.background }}>

          <View className='flex-row justify-between items-center'>
            <Pressable onPress={() => setIsEditing(!isEditing)} className="px-4 pt-4">
              <Text style={{ color: Colors.primary }}>{isEditing ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>

          {isEditing ? (
            <HabitReorderList />
          ) : (
            <HabitCompletions selectedDate={selectedDate} />
          )}

        </View>

    </SafeAreaView>
  );
}
