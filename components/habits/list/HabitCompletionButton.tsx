import { useCreateHabitCompletion, useDeleteHabitCompletion, useUpdateHabitCompletion } from '@/db/useHabitDb';
import { Colors } from '@/lib/Colors';
import { Habit, HabitCompletion } from '@/db/types';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import PillButton from '@/components/common/PillButton';

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
  const hasCountTarget = habit.countTarget != null && habit.countTarget > 0;
  const backgroundColor = hasCountTarget ? Colors.card : (isCompleted ? Colors.success : Colors.card);

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
      deleteCompletionMutation.mutate({ id: currentCompletion.id, completionDate: selectedDate });
    } else {
      updateCompletionMutation.mutate({
        id: currentCompletion.id,
        updates: { count: newCount },
        completionDate: selectedDate,
      });
    }
  }, [
    hasCountTarget,
    isCompleted,
    currentCount,
    currentCompletion,
    deleteCompletionMutation,
    updateCompletionMutation,
    selectedDate,
  ]);

  const handleCompletionToggle = useCallback(() => {
    if (hasCountTarget) {
      if (isCompleted && currentCompletion) {
        const newCount = currentCount + 1;
        updateCompletionMutation.mutate({
          id: currentCompletion.id,
          updates: { count: newCount },
          completionDate: selectedDate,
        });
      } else {
        addCompletionMutation.mutate({
          habitId: habit.id,
          completionDate: selectedDate,
          count: 1,
        });
      }
    } else {
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
    hasCountTarget,
  ]);

  const checkCompleted = hasCountTarget ? (currentCount >= (habit.countTarget ?? 0)) : isCompleted;
  const mutationsPending =
    deleteCompletionMutation.isPending ||
    addCompletionMutation.isPending ||
    updateCompletionMutation.isPending;

  return (
    <PillButton
      backgroundColor={backgroundColor}
      onMainPress={navigateToHabit}
      checkButton={{
        onPress: handleCompletionToggle,
        disabled: isPlusDisabled,
        loading: mutationsPending,
        completed: checkCompleted,
      }}
      multiCount={
        hasCountTarget
          ? {
              currentCount,
              targetCount: habit.countTarget!,
              onMinus: handleDecrement,
              minusDisabled: isMinusDisabled,
              plusDisabled: isPlusDisabled,
              loading: deleteCompletionMutation.isPending || updateCompletionMutation.isPending,
            }
          : undefined
      }
      text={habit.name}
      chevronColor={isCompleted ? Colors.text : Colors.textSecondary}
    />
  );
}
