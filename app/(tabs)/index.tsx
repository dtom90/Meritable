import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useHabits } from '@/hooks/useHabitQueries';
import { useHabitCompletions, useAddHabitCompletion, useDeleteHabitCompletion } from '@/hooks/useHabitQueries';
import { IconButton } from 'react-native-paper';

export default function HomeScreen() {
  const tabs = Array.from({ length: 7 }).map((_, index) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (6 - index));

    const year = targetDate.getFullYear();
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const day = targetDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [activeTab, setActiveTab] = useState(tabs[tabs.length - 1]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [fabHovered, setFabHovered] = useState(false);
  
  const { data: habits = [], isLoading: isLoadingHabits } = useHabits();
  const { data: completions = [], isLoading: isLoadingCompletions } = useHabitCompletions(activeTab);
  const addCompletionMutation = useAddHabitCompletion();
  const deleteCompletionMutation = useDeleteHabitCompletion();

  useFocusEffect(
    useCallback(() => {
      if (params.today) {
        setActiveTab(tabs[tabs.length - 1]);
        router.replace('/');
      }
    }, [params])
  );

  if (isLoadingHabits || isLoadingCompletions) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-row justify-around py-2.5 bg-[#1c1c1e] mb-2.5">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`py-2 px-1.5 ${activeTab === tab ? 'border-b-2 border-[#0A84FF]' : ''}`}
            onPress={() => setActiveTab(tab)}>
            <Text className={`text-sm ${activeTab === tab ? 'text-[#0A84FF] font-bold' : 'text-[#8e8e93]'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {habits.length === 0 && <TouchableOpacity
        className="rounded-lg p-4 bg-[#0A84FF] justify-center items-center shadow-lg"
        onPress={() => router.push('/habits?focusInput=true')}
        activeOpacity={0.8}
      >
        <Text className="text-white text-xl font-medium">Add Habit</Text>
      </TouchableOpacity>}

      <View className="max-w-3xl self-center w-full">
        {habits.map(habit => (
          <View
            key={habit.id}
            className={`flex-1 flex-row items-center py-2 px-4 m-4 rounded-lg min-h-[68px] ${completions.includes(habit.id!) ? 'bg-green-500' : 'bg-[#1c1c1e]'}`}
          >
            <Text className="text-lg text-white flex-1 text-center">{habit.name}</Text>
            {!completions.includes(habit.id!) ? (
              <IconButton
                icon="check"
                iconColor="green"
                size={24}
                onPress={() => addCompletionMutation.mutate({ habitId: habit.id!, date: activeTab })}
                className="ml-auto mr-0 p-0"
                disabled={addCompletionMutation.isPending}
              />
            ) : (
              <IconButton
                icon="restore"
                size={24}
                className="ml-auto mr-0 p-0"
                onPress={() => deleteCompletionMutation.mutate({ habitId: habit.id!, date: activeTab })}
                disabled={deleteCompletionMutation.isPending}
              />
            )}
          </View>
        ))}
      </View>
      <View className="absolute right-6 bottom-6 flex-row items-center">
        {fabHovered && (
          <View className="mr-4 py-1 px-3 bg-[#222] rounded-lg shadow-md z-10 self-center">
            <Text className="text-white text-base font-medium p-2">Add Habit</Text>
          </View>
        )}
        <TouchableOpacity
          className="relative w-16 h-16 rounded-full bg-[#0A84FF] justify-center items-center shadow-lg"
          onPress={() => router.push('/habits?focusInput=true')}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' ? {
            onMouseEnter: () => setFabHovered(true),
            onMouseLeave: () => setFabHovered(false),
          } : {})}
        >
          <Ionicons name="add" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

