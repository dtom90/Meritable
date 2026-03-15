import { View } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Habit } from '@/db/types';
import CountTargetInput from './CountTargetInput';
import ArchiveHabitButton from './ArchiveHabitButton';
import UnarchiveHabitButton from './UnarchiveHabitButton';
import DeleteHabitButton from './DeleteHabitButton';

export default function HabitActions({ habitId, habit }: { habitId: number; habit: Habit }) {
  const isArchived = habit.archived === true;

  return (
    <View className="p-6 rounded-lg" style={{ backgroundColor: Colors.surface }}>
      <View className="gap-3">
        {!isArchived && <CountTargetInput habitId={habitId} habit={habit} />}
        {isArchived ? (
          <UnarchiveHabitButton habitId={habitId} />
        ) : (
          <ArchiveHabitButton habitId={habitId} />
        )}
        <DeleteHabitButton habitId={habitId} />
      </View>
    </View>
  );
}
