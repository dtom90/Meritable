
import { useCreateHabitCompletion, useDeleteHabitCompletion, useUpdateHabitCompletion } from '@/db/useHabitDb';
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
  const updateCompletionMutation = useUpdateHabitCompletion();
  const router = useRouter();

  const navigateToHabit = () => {
    if (habit.id) {
      router.push(`/habits/${habit.id}`);
    }
  };

  const isCompleted = habitCompletionsMap[habit.id] ? true : false;
  const currentCompletion = habitCompletionsMap[habit.id];
  const currentCount = currentCompletion?.count ?? 0;
  // Handle null/undefined countTarget properly
  const hasCountTarget = habit.countTarget != null && habit.countTarget > 0;
  // Calculate completion percentage for countTarget case
  const completionPercentage = hasCountTarget && habit.countTarget! > 0
    ? Math.min((currentCount / habit.countTarget!) * 100, 100)
    : 0;
  // For countTarget case, always use card background so progress bar is visible
  // For non-countTarget case, use success when completed
  const backgroundColor = hasCountTarget ? Colors.card : (isCompleted ? Colors.success : Colors.card)
  const icon = hasCountTarget 
    ? (currentCount === habit.countTarget! ? 'check' : 'plus')
    : (isCompleted ? 'restore' : 'check')
  const iconColor = isCompleted ? Colors.text : Colors.success
  
  // Calculate disabled states
  const isMinusDisabled = hasCountTarget
    ? (currentCount === 0 || !isCompleted || !currentCompletion || deleteCompletionMutation.isPending || updateCompletionMutation.isPending)
    : false;
  const isPlusDisabled = 
    deleteCompletionMutation.isPending || 
    addCompletionMutation.isPending || 
    updateCompletionMutation.isPending;

  const handleDecrement = useCallback(() => {
    if (!hasCountTarget || !isCompleted || !currentCompletion) return;
    
    const newCount = currentCount - 1;
    if (newCount <= 0) {
      // Delete completion if count would be 0 or less
      deleteCompletionMutation.mutate({ id: currentCompletion.id, completionDate: selectedDate });
    } else {
      // Update count
      updateCompletionMutation.mutate({ 
        id: currentCompletion.id, 
        updates: { count: newCount },
        completionDate: selectedDate 
      });
    }
  }, [
    hasCountTarget,
    isCompleted,
    currentCount,
    currentCompletion,
    deleteCompletionMutation,
    updateCompletionMutation,
    selectedDate
  ]);

  const handleCompletionToggle = useCallback(() => {
    if (hasCountTarget) {
      // If habit has a count target, always increment
      if (isCompleted && currentCompletion) {
        // Increment existing completion
        const newCount = currentCount + 1;
        updateCompletionMutation.mutate({ 
          id: currentCompletion.id, 
          updates: { count: newCount },
          completionDate: selectedDate 
        });
      } else {
        // Create with count=1
        addCompletionMutation.mutate({ 
          habitId: habit.id, 
          completionDate: selectedDate,
          count: 1 
        });
      }
    } else {
      // If no count target, use toggle logic
      if (isCompleted && habitCompletionsMap[habit.id]?.id) {
        deleteCompletionMutation.mutate({ id: habitCompletionsMap[habit.id].id, completionDate: selectedDate });
      } else {
        addCompletionMutation.mutate({ habitId: habit.id, completionDate: selectedDate });
      }
    }
  }, [
    isCompleted, 
    habitCompletionsMap, 
    habit, 
    selectedDate, 
    deleteCompletionMutation, 
    addCompletionMutation,
    updateCompletionMutation,
    currentCompletion,
    currentCount,
    hasCountTarget
  ]);

  return (
    <View
      className="flex-1 flex-row items-center my-4 rounded-lg min-h-[68px] overflow-hidden"
      style={{ backgroundColor, position: 'relative' }}
    >
      {hasCountTarget && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${completionPercentage}%`,
            backgroundColor: Colors.success,
            zIndex: 0,
          }}
        />
      )}
      <TouchableOpacity 
        onPress={navigateToHabit}
        style={{ backgroundColor: 'transparent', zIndex: 1 }}
        className='flex-1 h-full flex flex-row items-center border-r border-gray-600'
      >
        <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
        <View className="flex-1 flex flex-row items-center justify-center">
          <Text className="text-lg text-center mr-1" style={{ color: Colors.text }}>{habit.name}</Text>
          {hasCountTarget && (
            <Text className="text-lg text-bold text-center ml-2 mr-2" style={{ color: Colors.text }}>
              {habitCompletionsMap[habit.id]?.count || 0} / {habit.countTarget}
            </Text>
          )}
          <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
        </View>
      </TouchableOpacity>
      
      {hasCountTarget && (
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={isMinusDisabled}
          className="h-full w-16 flex items-center justify-center border-r border-gray-600"
          style={{ backgroundColor: 'transparent', zIndex: 1 }}
        >
          {deleteCompletionMutation.isPending || updateCompletionMutation.isPending ? (
            <Icon source="loading" color={isMinusDisabled ? Colors.textSecondary : iconColor} size={24} />
          ) : (
            <Icon source="minus" color={isMinusDisabled ? Colors.textSecondary : iconColor} size={24} />
          )}
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        onPress={handleCompletionToggle}
        disabled={isPlusDisabled}
        className="h-full w-16 flex items-center justify-center"
        style={{ backgroundColor: 'transparent', zIndex: 1 }}
      >
        {deleteCompletionMutation.isPending || addCompletionMutation.isPending || updateCompletionMutation.isPending ? (
          <Icon source="loading" color={isPlusDisabled ? Colors.textSecondary : iconColor} size={24} />
        ) : (
          <Icon source={icon} color={isPlusDisabled ? Colors.textSecondary : iconColor} size={24} />
        )}
      </TouchableOpacity>
    </View>
  )
}
