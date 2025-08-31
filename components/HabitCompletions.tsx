import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useListHabits, useListHabitCompletions, useCreateHabitCompletion, useDeleteHabitCompletion } from '@/db/useHabitDb';
import useWindowWidth from '@/hooks/useWindowWidth';
import AddHabitButton from '@/components/AddHabitButton';

interface HabitCompletionsProps {
  selectedDate: string;
}

const widthThreshold = 950;

export default function HabitCompletions({ selectedDate }: HabitCompletionsProps) {
  const router = useRouter();
  const width = useWindowWidth();
  
  const { data: habits = [], isLoading: isLoadingHabits } = useListHabits();
  const { data: completions = [], isLoading: isLoadingCompletions } = useListHabitCompletions(selectedDate);
  
  const addCompletionMutation = useCreateHabitCompletion();
  const deleteCompletionMutation = useDeleteHabitCompletion();

  if (isLoadingHabits || isLoadingCompletions) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: Colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {habits.length === 0 && (
        <TouchableOpacity
          className="rounded-lg p-4 justify-center items-center shadow-lg"
          style={{ backgroundColor: Colors.primary }}
          onPress={() => router.push('/habits?focusInput=true')}
          activeOpacity={0.8}
        >
          <Text className="text-xl font-medium" style={{ color: Colors.text }}>Add Habit</Text>
        </TouchableOpacity>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
                  onPress={() => addCompletionMutation.mutate({ habitId: habit.id!, completionDate: selectedDate })}
                  className="ml-auto mr-0 p-0"
                  disabled={addCompletionMutation.isPending}
                />
              ) : (
                <IconButton
                  icon="restore"
                  iconColor={Colors.text}
                  size={24}
                  className="ml-auto mr-0 p-0"
                  onPress={() => deleteCompletionMutation.mutate({ habitId: habit.id!, completionDate: selectedDate })}
                  disabled={deleteCompletionMutation.isPending}
                />
              )}
            </View>
          ))}
          {width < widthThreshold && (
            <AddHabitButton withTooltip={false} />
          )}
        </View>
      </ScrollView>

      {width >= widthThreshold && (
        <AddHabitButton withTooltip={true} />
      )}
    </>
  );
}
