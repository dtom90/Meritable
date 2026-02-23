import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { NarrowView } from '@/components/NarrowView';
import Spinner from '@/components/Spinner';
import { useListExercises, useCreateExercise } from '@/db/useWorkoutDb';
import type { Exercise } from '@/db/habitDatabase';

export default function WorkoutsScreen() {
  const router = useRouter();
  const { data: exercises = [], isLoading } = useListExercises();
  const createExercise = useCreateExercise();
  const [newName, setNewName] = useState('');

  const handleAddExercise = () => {
    const name = newName.trim();
    if (!name || createExercise.isPending) return;
    if (Platform.OS !== 'web') Keyboard.dismiss();
    createExercise.mutate(
      { name },
      {
        onSuccess: () => setNewName(''),
      }
    );
  };

  const handlePressExercise = (exercise: Exercise) => {
    if (exercise.id != null) {
      router.push(`/workouts/${exercise.id}`);
    }
  };

  return (
    <NarrowView>
      <View className="flex-row mb-5">
        <TextInput
          className="flex-1 p-2.5 mr-2.5 rounded"
          style={{ backgroundColor: Colors.card, color: Colors.text }}
          placeholder="Add an exercise..."
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleAddExercise}
          placeholderTextColor={Colors.textSecondary}
        />
        <TouchableOpacity
          className="py-3 px-5 rounded items-center"
          style={{
            backgroundColor: createExercise.isPending ? Colors.textTertiary : Colors.primary,
          }}
          onPress={handleAddExercise}
          disabled={createExercise.isPending}
        >
          <Text className="text-base font-bold" style={{ color: Colors.text }}>
            {createExercise.isPending ? 'Adding...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Spinner />
      ) : exercises.length === 0 ? (
        <Text style={{ color: Colors.textSecondary }}>No exercises yet. Add one above.</Text>
      ) : (
        <View className="gap-2">
          {exercises.map((exercise) => (
            <Pressable
              key={exercise.id}
              onPress={() => handlePressExercise(exercise)}
              className="p-4 rounded"
              style={{ backgroundColor: Colors.card }}
            >
              <Text style={{ color: Colors.text, fontSize: 17 }}>{exercise.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </NarrowView>
  );
}
