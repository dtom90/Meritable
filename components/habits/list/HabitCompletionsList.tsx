import { useCallback, useState } from 'react';
import { View, Pressable, Text, Alert } from 'react-native';
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
  useArchiveHabit,
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
  const archiveHabitMutation = useArchiveHabit();
  const [archivingHabitId, setArchivingHabitId] = useState<number | null>(null);
  const router = useRouter();

  const handleArchiveHabit = useCallback(
    (habitId: number) => {
      Alert.alert(
        'Archive Habit',
        'Archive this habit? You can restore it by filtering on Archived in the habit list.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            onPress: () => {
              setArchivingHabitId(habitId);
              archiveHabitMutation.mutate(habitId, {
                onSettled: () => setArchivingHabitId(null),
              });
            },
          },
        ]
      );
    },
    [archiveHabitMutation]
  );

  const getHabitArchiveButton = useCallback(
    (habit: Habit) => {
      if (habit.id == null) return undefined;
      return {
        onPress: () => handleArchiveHabit(habit.id!),
        icon: 'archive',
        iconColor: Colors.primary,
        loading: archivingHabitId === habit.id && archiveHabitMutation.isPending,
        disabled: archiveHabitMutation.isPending && archivingHabitId !== habit.id,
      };
    },
    [archivingHabitId, archiveHabitMutation.isPending, handleArchiveHabit]
  );

  const showActive = filter === 'active';
  const isLoading = showActive ? isLoadingHabits : isLoadingArchived;

  const handleRefresh = () => {
    void refetch();
    void refetchArchived();
  };

  const listBody = (
    <>
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
            getItemSecondaryButton={getHabitArchiveButton}
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
    </>
  );

  return (
    <NarrowView
      disableScroll={isEditing}
      refreshing={isFetching}
      onRefresh={handleRefresh}
    >
      {isEditing ? (
        <View className="flex-1 min-h-0">{listBody}</View>
      ) : (
        listBody
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
          No archived habits. Archive a habit from edit mode or its detail screen.
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
