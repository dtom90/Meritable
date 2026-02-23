import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/NarrowView';
import Spinner from '@/components/Spinner';
import { getToday } from '@/lib/dateUtils';
import { useListExercises, useListSetsByExerciseId, useCreateSet } from '@/db/useWorkoutDb';
import type { Set } from '@/db/habitDatabase';

function formatSetRow(s: Set): string {
  if (s.weight != null && s.weight > 0) {
    return `${s.weight} lbs × ${s.reps}`;
  }
  return `${s.reps} reps`;
}

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const id = exerciseId != null ? Number(exerciseId) : NaN;
  const { data: exercises = [] } = useListExercises();
  const { data: sets = [], isLoading: setsLoading } = useListSetsByExerciseId(id);
  const createSet = useCreateSet();

  const exercise = exercises.find((e) => e.id === id);

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
        exerciseId: id,
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

  if (!exercise) {
    return (
      <View
        className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full"
        style={{ backgroundColor: Colors.background }}
      >
        <Text style={{ color: Colors.text }}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <NarrowView>
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Icon source="arrow-left" color={Colors.text} size={24} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-2xl font-bold text-center"
          style={{ color: Colors.text }}
        >
          {exercise.name}
        </Text>
        <View style={{ width: 32 }} />
      </View>

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
              backgroundColor: createSet.isPending
                ? Colors.textTertiary
                : Colors.primary,
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

      <Text className="text-base mb-2" style={{ color: Colors.textSecondary }}>
        History
      </Text>
      {setsLoading ? (
        <Spinner />
      ) : sets.length === 0 ? (
        <Text style={{ color: Colors.textSecondary }}>
          No sets yet. Add one above.
        </Text>
      ) : (
        <View className="gap-2">
          {sets.map((s) => (
            <View
              key={s.id}
              className="p-3 rounded flex-row justify-between items-center"
              style={{ backgroundColor: Colors.card }}
            >
              <Text style={{ color: Colors.text }}>{formatSetRow(s)}</Text>
              {s.completionDate ? (
                <Text
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  {s.completionDate}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </NarrowView>
  );
}
