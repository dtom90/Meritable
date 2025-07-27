import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useListHabits } from '@/db/useHabitDb';
import { useListHabitCompletions, useCreateHabitCompletion, useDeleteHabitCompletion } from '@/db/useHabitDb';
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
  
  const { data: habits = [], isLoading: isLoadingHabits } = useListHabits();
  const { data: completions = [], isLoading: isLoadingCompletions } = useListHabitCompletions(activeTab);
  const addCompletionMutation = useCreateHabitCompletion();
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
        <Text style={{ color: Colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <View className="flex-row justify-around py-2.5 mb-2.5" style={{ backgroundColor: Colors.surface }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`py-2 px-1.5 ${activeTab === tab ? 'border-b-2' : ''}`}
            style={activeTab === tab ? { borderBottomColor: Colors.primary } : {}}
            onPress={() => setActiveTab(tab)}>
            <Text 
              className={`text-sm ${activeTab === tab ? 'font-bold' : ''}`}
              style={{ color: activeTab === tab ? Colors.primary : Colors.textSecondary }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {habits.length === 0 && <TouchableOpacity
        className="rounded-lg p-4 justify-center items-center shadow-lg"
        style={{ backgroundColor: Colors.primary }}
        onPress={() => router.push('/habits?focusInput=true')}
        activeOpacity={0.8}
      >
        <Text className="text-xl font-medium" style={{ color: Colors.text }}>Add Habit</Text>
      </TouchableOpacity>}

      <View className="max-w-3xl self-center w-full">
        {habits.map(habit => (
          <View
            key={habit.id}
            className="flex-1 flex-row items-center py-2 px-4 m-4 rounded-lg min-h-[68px]"
            style={{ backgroundColor: completions.includes(habit.id!) ? Colors.success : Colors.surface }}
          >
            <Text className="text-lg flex-1 text-center" style={{ color: Colors.text }}>{habit.name}</Text>
            {!completions.includes(habit.id!) ? (
              <IconButton
                icon="check"
                iconColor={Colors.success}
                size={24}
                onPress={() => addCompletionMutation.mutate({ habitId: habit.id!, date: activeTab })}
                className="ml-auto mr-0 p-0"
                disabled={addCompletionMutation.isPending}
              />
            ) : (
              <IconButton
                icon="restore"
                iconColor={Colors.text}
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
          <View className="mr-4 py-1 px-3 rounded-lg shadow-md z-10 self-center" style={{ backgroundColor: Colors.card }}>
            <Text className="text-base font-medium p-2" style={{ color: Colors.text }}>Add Habit</Text>
          </View>
        )}
        <TouchableOpacity
          className="relative w-16 h-16 rounded-full justify-center items-center shadow-lg"
          style={{ backgroundColor: Colors.primary }}
          onPress={() => router.push('/habits?focusInput=true')}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' ? {
            onMouseEnter: () => setFabHovered(true),
            onMouseLeave: () => setFabHovered(false),
          } : {})}
        >
          <Ionicons name="add" size={40} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

