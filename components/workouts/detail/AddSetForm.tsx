import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Keyboard } from 'react-native';
import { Colors } from '@/lib/Colors';
import { getToday } from '@/lib/dateUtils';
import { useCreateSet } from '@/db/useWorkoutDb';

type AddSetFormProps = {
  exerciseId: number;
};

export function AddSetForm({ exerciseId }: AddSetFormProps) {
  const createSet = useCreateSet();
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');

  const handleAddSet = () => {
    const reps = parseInt(repsInput.trim(), 10);
    if (Number.isNaN(reps) || reps < 1 || createSet.isPending) return;
    const weight =
      weightInput.trim() === '' ? null : parseFloat(weightInput.trim());
    const weightNum =
      weight != null && !Number.isNaN(weight) && weight >= 0 ? weight : null;
    if (Platform.OS !== 'web') Keyboard.dismiss();
    createSet.mutate(
      {
        exerciseId,
        weight: weightNum,
        reps,
        completionDate: getToday(),
      },
      {
        onSuccess: () => {
          setWeightInput('');
          setRepsInput('');
        },
      }
    );
  };

  return (
    <View className="mb-6">
      <Text className="text-base mb-2" style={{ color: Colors.textSecondary }}>
        Add set
      </Text>
      <View className="flex-row items-center gap-2 flex-wrap">
        <TextInput
          className="flex-1 min-w-[80px] p-2.5 rounded"
          style={{ backgroundColor: Colors.card, color: Colors.text }}
          placeholder="Weight (lbs)"
          placeholderTextColor={Colors.textSecondary}
          value={weightInput}
          onChangeText={setWeightInput}
          keyboardType="decimal-pad"
        />
        <TextInput
          className="flex-1 min-w-[80px] p-2.5 rounded"
          style={{ backgroundColor: Colors.card, color: Colors.text }}
          placeholder="Reps *"
          placeholderTextColor={Colors.textSecondary}
          value={repsInput}
          onChangeText={setRepsInput}
          keyboardType="number-pad"
        />
        <TouchableOpacity
          className="py-2.5 px-4 rounded"
          style={{
            backgroundColor: createSet.isPending ? Colors.textTertiary : Colors.primary,
          }}
          onPress={handleAddSet}
          disabled={createSet.isPending || !repsInput.trim()}
        >
          <Text className="font-bold" style={{ color: Colors.text }}>
            {createSet.isPending ? '...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
