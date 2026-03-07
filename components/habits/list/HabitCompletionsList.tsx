import { useState } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import HabitCompletions from './HabitCompletions';
import HabitsReorderListWeb from './HabitsReorderListWeb';
import HabitsReorderListMobile from './HabitsReorderListMobile';
import { NarrowView } from '@/components/common/NarrowView';
import AddHabitButton from './AddHabitButton';
import { useListHabits } from '@/db/useHabitDb';
import Spinner from '@/components/common/Spinner';

interface HabitCompletionsListProps {
  selectedDate: string;
}

export default function HabitCompletionsList({ selectedDate }: HabitCompletionsListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: habits, isLoading: isLoadingHabits, refetch, isFetching } = useListHabits();

  return (
    <NarrowView
      disableScroll={isEditing}
      refreshing={isFetching}
      onRefresh={() => { void refetch(); }}
    >

      {habits && habits.length > 0 && (
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
          {Platform.OS === 'web' ? (
            <HabitsReorderListWeb />
          ) : (
            <HabitsReorderListMobile />
          )}
          <AddHabitButton />
        </View>
      ) : habits && habits.length === 0 ? (
        <AddHabitButton />
      ) : (habits && habits.length > 0 && (
        <HabitCompletions selectedDate={selectedDate} habits={habits} />
      ))}

    </NarrowView>
  );
}
