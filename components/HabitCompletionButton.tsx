
import { useCreateHabitCompletion, useDeleteHabitCompletion } from '@/db/useHabitDb';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { Habit, HabitCompletion } from '@/db/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';


interface HabitCompletionButtonProps {
  habit: Habit;
  selectedDate: string;
  habitCompletionsMap: Record<number, HabitCompletion>;
}

export default function HabitCompletionButton({ habit, selectedDate, habitCompletionsMap }: HabitCompletionButtonProps) {
  const addCompletionMutation = useCreateHabitCompletion();
  const deleteCompletionMutation = useDeleteHabitCompletion();
  const router = useRouter();

  const navigateToHabit = () => {
    if (habit.id) {
      router.push(`/habits/${habit.id}`);
    }
  };

  const isCompleted = habitCompletionsMap[habit.id] ? true : false;
  const backgroundColor = isCompleted ? Colors.success : Colors.card
  const icon = isCompleted ? 'restore' : 'check'
  const iconColor = isCompleted ? Colors.text : Colors.success

  const handleCompletionToggle = useCallback(() => {
    if (isCompleted) {
      deleteCompletionMutation.mutate({ id: habitCompletionsMap[habit.id].id, completionDate: selectedDate });
    } else {
      addCompletionMutation.mutate({ habitId: habit.id, completionDate: selectedDate });
    }
  }, [isCompleted, habitCompletionsMap, habit, selectedDate, deleteCompletionMutation, addCompletionMutation]);

  return (
    <View
      className="flex-1 flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden"
      style={{ backgroundColor }}
    >
      <TouchableOpacity 
        onPress={navigateToHabit}
        style={{ backgroundColor }}
        className='flex-1 h-full flex flex-row items-center border-r border-gray-600'
      >
        <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
        <View className="flex-1 flex flex-row items-center justify-center">
          <Text className="text-lg text-center mr-1" style={{ color: Colors.text }}>{habit.name}</Text>
          <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={handleCompletionToggle}
        disabled={isCompleted ? deleteCompletionMutation.isPending : addCompletionMutation.isPending}
        className="h-full w-16 flex items-center justify-center"
        style={{ backgroundColor }}
      >
        {deleteCompletionMutation.isPending || addCompletionMutation.isPending ? (
          <Icon source="loading" color={iconColor} size={24} />
        ) : (
          <Icon source={icon} color={iconColor} size={24} />
        )}
      </TouchableOpacity>
    </View>
  )
}
