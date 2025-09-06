import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useListHabits, useListHabitCompletionsByDate, useCreateHabitCompletion, useDeleteHabitCompletion } from '@/db/useHabitDb';
import useWindowWidth from '@/hooks/useWindowWidth';
import AddHabitButton from '@/components/AddHabitButton';
import { HabitCompletion } from '@/db/types';

interface HabitCompletionsProps {
  selectedDate: string;
}

const widthThreshold = 950;

export default function HabitCompletions({ selectedDate }: HabitCompletionsProps) {
  const router = useRouter();
  const width = useWindowWidth();
  
  const { data: habits = [], isLoading: isLoadingHabits } = useListHabits();
  const { data: completions = [], isLoading: isLoadingCompletions } = useListHabitCompletionsByDate(selectedDate);
  const habitCompletionsMap = useMemo(() => {
    return completions.reduce((acc, completion) => {
      acc[completion.habitId] = completion;
      return acc;
    }, {} as Record<number, HabitCompletion>);
  }, [completions]);
  
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
          className="rounded-lg p-4 m-8 justify-center items-center shadow-lg"
          style={{ backgroundColor: Colors.primary }}
          onPress={() => router.push('/habits?focusInput=true')}
          activeOpacity={0.8}
        >
          <Text className="text-xl font-medium" style={{ color: Colors.text }}>Add Habit</Text>
        </TouchableOpacity>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="max-w-3xl self-center w-full my-4">
          {habits.map(habit => (
            <View
              key={habit.id}
              className="flex-1 flex-row items-center py-2 px-4 m-4 rounded-lg min-h-[68px]"
              style={{ backgroundColor: habitCompletionsMap[habit.id] ? Colors.success : Colors.surface }}
            >
              <Text className="text-lg flex-1 text-center" style={{ color: Colors.text }}>{habit.name}</Text>
              <View className="ml-auto mr-0 my-auto p-0">
                {!habitCompletionsMap[habit.id] ? (
                  <IconButton
                    icon="check"
                    iconColor={Colors.success}
                    size={24}
                    onPress={() => addCompletionMutation.mutate({ habitId: habit.id, completionDate: selectedDate })}
                    disabled={addCompletionMutation.isPending}
                  />
                ) : (
                  <IconButton
                    icon="restore"
                    iconColor={Colors.text}
                    size={24}
                    onPress={() => deleteCompletionMutation.mutate({ id: habitCompletionsMap[habit.id].id, completionDate: selectedDate })}
                    disabled={deleteCompletionMutation.isPending}
                  />
                )}
              </View>
            </View>
          ))}
          {habits.length && width < widthThreshold && (
            <AddHabitButton withTooltip={false} />
          )}
        </View>
      </ScrollView>

      {habits.length && width >= widthThreshold && (
        <AddHabitButton withTooltip={true} />
      )}
    </>
  );
}
