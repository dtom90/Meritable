import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useListHabits, useCreateHabit } from '@/db/useHabitDb';
import { Icon } from 'react-native-paper';

export default function HabitManager() {
  const { data: habits = [], isLoading } = useListHabits();
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
      addHabitMutation.mutate({ name: newHabitText.trim() });
      setNewHabitText('');
    }
  };



  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
        <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
          <Text style={{ color: Colors.text }}>Loading habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-[50px] px-5 max-w-[800px] self-center w-full">
          <Text className="mb-5 text-center text-3xl font-bold leading-8" style={{ color: Colors.text }}>Manage Habits</Text>
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
          {habits.map(habit => (
            <View key={habit.id} className="flex-row items-center p-4 my-4 rounded-lg min-h-[68px]" style={{ backgroundColor: Colors.surface }}>
              <TouchableOpacity className="flex-row items-center gap-2" onPress={() => router.push('/(tabs)/?today=true')}>
                <Icon source="clock" color={Colors.textSecondary} size={24} />
                <Text style={{ color: Colors.textSecondary }}>Track</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center" 
                onPress={() => router.push(`/habits/${habit.id}`)}
              >
                <Text className="text-lg text-center" style={{ color: Colors.text }}>{habit.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push(`/habits/${habit.id}`)}>
                <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

