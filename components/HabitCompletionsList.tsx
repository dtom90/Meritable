import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import HabitCompletions from '@/components/HabitCompletions';
import HabitReorderList from '@/components/HabitReorderList';
import { NarrowView } from '@/components/NarrowView';
import AddHabitButton from '@/components/AddHabitButton';
import { useListHabits } from '@/db/useHabitDb';
import Spinner from '@/components/Spinner';

interface HabitCompletionsListProps {
  selectedDate: string;
}

export default function HabitCompletionsList({ selectedDate }: HabitCompletionsListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: habits, isLoading: isLoadingHabits } = useListHabits();

  return (
    <NarrowView disableScroll={isEditing}>

      {habits && habits.length > 1 && (
        <View className='flex-row justify-between items-center'>
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: Colors.primary }}>{isEditing ? 'Done' : 'Edit'}</Text>
          </Pressable>
        </View>
      )}

      {isLoadingHabits ? (
        <Spinner />
      ) : isEditing ? (
        <View className="flex-1">
          <HabitReorderList />
          <AddHabitButton withTooltip={false} />
        </View>
      ) : (habits && habits.length > 0 && (
        <HabitCompletions selectedDate={selectedDate} habits={habits} />
      ))}

    </NarrowView>
  );
}
