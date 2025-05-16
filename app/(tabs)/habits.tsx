import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useHabits, useAddHabit, useDeleteHabit } from '@/hooks/useHabitQueries';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Icon, IconButton } from 'react-native-paper';

export default function HabitManager() {
  const { data: habits = [], isLoading } = useHabits();
  const addHabitMutation = useAddHabit();
  const deleteHabitMutation = useDeleteHabit();
  const [newHabitText, setNewHabitText] = useState('');
  const textInputRef = useRef<TextInput>(null);
  const route = useRoute<RouteProp<RootStackParamList, 'habits'>>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'habits'>>();

  useFocusEffect(
    useCallback(() => {
      if (route.params?.focusInput) {
        textInputRef.current?.focus();
        navigation.setParams({ focusInput: false });
      }
    }, [route.params])
  );

  const handleAddHabit = () => {
    if (newHabitText.trim()) {
      addHabitMutation.mutate({ name: newHabitText.trim() });
      setNewHabitText('');
    }
  };

  const handleDeleteHabit = (habitId: number) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabitMutation.mutate(habitId);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
        <ThemedText>Loading habits...</ThemedText>
      </View>
    );
  }

  return (
    <View className="flex-1 pt-[50px] px-5 max-w-[800px] self-center w-full">
      <ThemedText type="title" className="mb-5 text-center">Manage Habits</ThemedText>
      <View className="flex-row mb-5">
        <TextInput
          className="flex-1 p-2.5 mr-2.5 rounded bg-[#333] text-white"
          placeholder="Add a new habit..."
          value={newHabitText}
          onChangeText={setNewHabitText}
          onSubmitEditing={handleAddHabit}
          ref={textInputRef}
          blurOnSubmit={false}
          placeholderTextColor="#888"
        />
        <TouchableOpacity 
          className={`py-3 px-5 rounded items-center ${addHabitMutation.isPending ? 'bg-[#666]' : 'bg-[#007bff]'}`}
          onPress={handleAddHabit}
          disabled={addHabitMutation.isPending}
        >
          <Text className="text-white text-base font-bold">
            {addHabitMutation.isPending ? 'Adding...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
      {habits.map(habit => (
        <ThemedView key={habit.id} className="flex-row items-center p-4 my-4 rounded-lg min-h-[68px]">
          <TouchableOpacity className="flex-row items-center gap-2" onPress={() => navigation.navigate('index', { today: true })}>
            <Icon source="clock" color="#49453f" size={24} />
            <Text className="text-[#49453f]">Track</Text>
          </TouchableOpacity>
          <Text className="text-lg text-white flex-1 text-center">{habit.name}</Text>
          <IconButton
            icon="delete"
            size={24}
            onPress={() => handleDeleteHabit(habit.id!)}
            disabled={deleteHabitMutation.isPending}
          />
        </ThemedView>
      ))}
    </View>
  );
}

