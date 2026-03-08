import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import HabitCompletions from './HabitCompletions';
import { NarrowView } from '@/components/common/NarrowView';
import { ReorderEditLayout } from '@/components/common/ReorderEditLayout';
import AddHabitButton from './AddHabitButton';
import { useListHabits, useReorderHabits } from '@/db/useHabitDb';
import Spinner from '@/components/common/Spinner';

interface HabitCompletionsListProps {
  selectedDate: string;
}

export default function HabitCompletionsList({ selectedDate }: HabitCompletionsListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: habits = [], isLoading: isLoadingHabits, refetch, isFetching } = useListHabits();
  const { mutate: reorderHabits } = useReorderHabits();

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
        <ReorderEditLayout
          footer={<AddHabitButton />}
          data={habits}
          getItemId={(h) => h.id?.toString() || ''}
          getItemLabel={(h) => h.name}
          onReorder={(reordered) =>
            reorderHabits(reordered.map((h, i) => ({ ...h, order: i })))}
          loading={isLoadingHabits}
        />
      ) : (<>
        <HabitCompletions selectedDate={selectedDate} habits={habits} />
        <AddHabitButton />
      </>
      )}

    </NarrowView>
  );
}
