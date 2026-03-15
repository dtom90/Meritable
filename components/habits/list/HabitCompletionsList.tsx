import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import HabitCompletions from './HabitCompletions';
import { NarrowView } from '@/components/common/NarrowView';
import { ReorderEditLayout } from '@/components/common/ReorderEditLayout';
import AddHabitButton from './AddHabitButton';
import PillButton from '@/components/common/PillButton';
import {
  useListHabits,
  useListArchivedHabits,
  useReorderHabits,
} from '@/db/useHabitDb';
import Spinner from '@/components/common/Spinner';
import type { Habit } from '@/db/types';

interface HabitCompletionsListProps {
  selectedDate: string;
}

type HabitFilter = 'active' | 'archived';

export default function HabitCompletionsList({ selectedDate }: HabitCompletionsListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState<HabitFilter>('active');
  const { data: habits = [], isLoading: isLoadingHabits, refetch, isFetching } = useListHabits();
  const { data: archivedHabits = [], isLoading: isLoadingArchived, refetch: refetchArchived } = useListArchivedHabits();
  const { mutate: reorderHabits } = useReorderHabits();
  const router = useRouter();

  const showActive = filter === 'active';
  const isLoading = showActive ? isLoadingHabits : isLoadingArchived;

  const handleRefresh = () => {
    void refetch();
    void refetchArchived();
  };

  return (
    <NarrowView
      disableScroll={isEditing}
      refreshing={isFetching}
      onRefresh={handleRefresh}
    >
      <View className="flex-row justify-between items-center mb-2">
        {showActive && habits && habits.length > 0 ? (
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: Colors.primary }}>{isEditing ? 'Done' : 'Edit'}</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable onPress={() => setFilter(showActive ? 'archived' : 'active')}>
          <Text style={{ color: Colors.primary }}>
            {showActive ? 'Archived' : 'Active'}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Spinner />
      ) : showActive ? (
        isEditing ? (
          <ReorderEditLayout
            footer={<AddHabitButton />}
            data={habits}
            getItemId={(h) => h.id?.toString() || ''}
            getItemLabel={(h) => h.name}
            onReorder={(reordered) =>
              reorderHabits(reordered.map((h, i) => ({ ...h, order: i })))}
            loading={isLoadingHabits}
          />
        ) : (
          <>
            <HabitCompletions selectedDate={selectedDate} habits={habits} />
            <AddHabitButton />
          </>
        )
      ) : (
        <ArchivedHabitsList habits={archivedHabits} onPressHabit={(id) => router.push(`/habits/${id}`)} />
      )}
    </NarrowView>
  );
}

function ArchivedHabitsList({
  habits,
  onPressHabit,
}: {
  habits: Habit[];
  onPressHabit: (id: number) => void;
}) {
  if (habits.length === 0) {
    return (
      <View className="py-8">
        <Text className="text-center" style={{ color: Colors.textSecondary }}>
          No archived habits. Archive a habit from its detail screen.
        </Text>
      </View>
    );
  }
  return (
    <View>
      {habits.map((habit) => (
        <PillButton
          key={habit.id}
          text={habit.name}
          onMainPress={() => habit.id != null && onPressHabit(habit.id)}
        />
      ))}
    </View>
  );
}
