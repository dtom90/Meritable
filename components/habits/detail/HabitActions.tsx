import { View } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useListHabits } from '@/db/useHabitDb';
import CountTargetInput from './CountTargetInput';
import ArchiveHabitButton from './ArchiveHabitButton';
import DeleteHabitButton from './DeleteHabitButton';

export default function HabitActions({ habitId }: { habitId: number }) {
  const { data: habits = [] } = useListHabits();
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return null;
  }

  return (
    <View className="p-6 rounded-lg" style={{ backgroundColor: Colors.surface }}>
      <View className="space-y-3">
        <CountTargetInput habitId={habitId} habit={habit} />
        <ArchiveHabitButton habitId={habitId} />
        <DeleteHabitButton habitId={habitId} />
      </View>
    </View>
  );
}
