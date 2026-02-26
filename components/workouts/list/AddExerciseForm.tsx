import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Keyboard } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useCreateExercise } from '@/db/useWorkoutDb';

export function AddExerciseForm() {
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

  return (
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
  );
}
