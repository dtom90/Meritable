import { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useUpdateHabit } from '@/db/useHabitDb';

type HabitWithCountTarget = { id: number; countTarget?: number | null };

export default function CountTargetInput({
  habitId,
  habit,
}: {
  habitId: number;
  habit: HabitWithCountTarget;
}) {
  const updateHabitMutation = useUpdateHabit();
  const [countTarget, setCountTarget] = useState<string>('');

  useEffect(() => {
    if (habit?.countTarget !== undefined && habit.countTarget !== null) {
      setCountTarget(habit.countTarget.toString());
    } else {
      setCountTarget('');
    }
  }, [habit?.countTarget]);

  const handleCountTargetChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setCountTarget(value);
    }
  };

  const handleCountTargetBlur = async () => {
    const numericValue = countTarget === '' ? null : parseInt(countTarget, 10);

    if (numericValue !== habit.countTarget) {
      try {
        await updateHabitMutation.mutateAsync({
          id: habitId,
          updates: { countTarget: numericValue ?? undefined },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error updating count target:', error);
        setCountTarget(habit.countTarget?.toString() ?? '');
      }
    }
  };

  return (
    <View className="p-4 rounded-lg" style={{ backgroundColor: Colors.card }}>
      <Text className="text-base mb-2" style={{ color: Colors.text }}>
        Count Target (optional)
      </Text>
      <TextInput
        className="p-3 rounded"
        style={{
          backgroundColor: Colors.background,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.textSecondary + '40',
        }}
        placeholder="Enter target count..."
        value={countTarget}
        onChangeText={handleCountTargetChange}
        onBlur={handleCountTargetBlur}
        keyboardType="numeric"
        placeholderTextColor={Colors.textSecondary}
      />
    </View>
  );
}
