import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import WeekHeader from '@/components/WeekHeader';
import HabitCompletions from '@/components/HabitCompletions';
import { getToday } from '@/lib/dateUtils';
import HabitReorderList from '@/components/HabitReorderList';
import { NarrowView } from '@/components/NarrowView';
import AddHabitButton from '@/components/AddHabitButton';


export default function HomeScreen() {
  const today = getToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <WeekHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate} />
      
      <NarrowView>

        <View className='flex-row justify-between items-center'>
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: Colors.primary }}>{isEditing ? 'Done' : 'Edit'}</Text>
          </Pressable>
        </View>

        {isEditing ? (
          <HabitReorderList />
        ) : (
          <HabitCompletions selectedDate={selectedDate} />
        )}

        <AddHabitButton withTooltip={false} />

      </NarrowView>
    </>
  );
}
