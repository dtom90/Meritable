import React, { useRef, useState, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { useCreateHabit } from '@/db/useHabitDb';

interface HabitInputFormProps {
  onSuccess?: () => void;
}

export default function HabitInputForm({ onSuccess }: HabitInputFormProps = {}) {
  const addHabitMutation = useCreateHabit();
  const [newHabitText, setNewHabitText] = useState('');
  const textInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      if (params.focusInput) {
        textInputRef.current?.focus();
        router.replace('/habits');
      }
    }, [params])
  );

  const handleCreateHabit = () => {
    if (newHabitText.trim()) {
      addHabitMutation.mutate(
        { name: newHabitText.trim() },
        {
          onSuccess: () => {
            setNewHabitText('');
            onSuccess?.();
          }
        }
      );
    }
  };

  return (
    <View className="flex-row mb-5">
      <TextInput
        className="flex-1 p-2.5 mr-2.5 rounded"
        style={{ backgroundColor: Colors.card, color: Colors.text }}
        placeholder="Add a new habit..."
        value={newHabitText}
        onChangeText={setNewHabitText}
        onSubmitEditing={handleCreateHabit}
        ref={textInputRef}
        blurOnSubmit={false}
        placeholderTextColor={Colors.textSecondary}
      />
      <TouchableOpacity 
        className="py-3 px-5 rounded items-center"
        style={{ backgroundColor: addHabitMutation.isPending ? Colors.textTertiary : Colors.primary }}
        onPress={handleCreateHabit}
        disabled={addHabitMutation.isPending}
      >
        <Text className="text-base font-bold" style={{ color: Colors.text }}>
          {addHabitMutation.isPending ? 'Adding...' : 'Add'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
