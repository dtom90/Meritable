import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dexieDb } from './dexieDb';
import { Habit, HabitCompletion } from './types'

/**
 *  Query keys
 */

const HABITS_QUERY_KEY = 'habits';
const HABIT_COMPLETIONS_QUERY_KEY = 'habitCompletions';

/**
 *  Hooks for habits
 */

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habitData: Omit<Habit, 'id' | 'shouldSync'>) => {
      await dexieDb.habits.add({ ...habitData, shouldSync: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
  });
};

export const useListHabits = () => {
  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: () => dexieDb.habits.toArray(),
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habitId: number) => {
      await dexieDb.habits.delete(habitId);
      await dexieDb.habitCompletions.where('habitId').equals(habitId).delete();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [HABIT_COMPLETIONS_QUERY_KEY] });
    },
  });
};

/**
 *  Hooks for habit completions
 */

export const useCreateHabitCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ habitId, completionDate }: { habitId: number; completionDate: string }) => {
      await dexieDb.habitCompletions.add({ habitId, completionDate, shouldSync: true });
    },
    onSuccess: (_, { completionDate }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate] 
      });
    },
  });
};

export const useListHabitCompletions = (completionDate: string) => {
  return useQuery({
    queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate],
    queryFn: async () => {
      const completions = await dexieDb.habitCompletions
        .where('completionDate')
        .equals(completionDate)
        .toArray();
      return completions.map((completion: HabitCompletion) => completion.habitId);
    },
  });
};

export const useDeleteHabitCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ habitId, completionDate }: { habitId: number; completionDate: string }) => {
      await dexieDb.habitCompletions.where({ habitId, completionDate }).delete();
    },
    onSuccess: (_, { completionDate }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate] 
      });
    },
  });
};
