import { useState } from 'react';
import { View, Pressable, Text, TouchableOpacity } from 'react-native';
import { Colors } from '@/lib/Colors';
import HabitCompletions from './HabitCompletions';
import { NarrowView } from '@/components/common/NarrowView';
import { ReorderEditLayout } from '@/components/common/ReorderEditLayout';
import AddHabitButton from './AddHabitButton';
import {
  useListHabits,
  useListArchivedHabits,
  useReorderHabits,
  useUnarchiveHabit,
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
  const { mutate: unarchiveHabit } = useUnarchiveHabit();

  const showActive = filter === 'active';
  const habitsToShow = showActive ? habits : archivedHabits;
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
        <Pressable
          onPress={() => setFilter(showActive ? 'archived' : 'active')}
          className="px-3 py-2 rounded-lg"
          style={{ backgroundColor: Colors.card }}
        >
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
        <ArchivedHabitsList habits={archivedHabits} onUnarchive={(id) => unarchiveHabit(id)} />
      )}
    </NarrowView>
  );
}

function ArchivedHabitsList({
  habits,
  onUnarchive,
}: {
  habits: Habit[];
  onUnarchive: (id: number) => void;
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
        <View
          key={habit.id}
          className="flex-row items-center justify-between p-4 rounded-lg mb-2"
          style={{ backgroundColor: Colors.card }}
        >
          <Text className="text-lg flex-1" style={{ color: Colors.text }}>
            {habit.name}
          </Text>
          <TouchableOpacity
            onPress={() => habit.id != null && onUnarchive(habit.id)}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: Colors.primary }}
          >
            <Text style={{ color: Colors.surface }}>Unarchive</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
