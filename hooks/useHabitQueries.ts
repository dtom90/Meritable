import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dexieDb } from '../db/dexieDb';
import { Habit, HabitCompletion } from '../db/types'

// Query keys
const HABITS_QUERY_KEY = 'habits';
const HABIT_COMPLETIONS_QUERY_KEY = 'habitCompletions';

// Hooks for habits
export const useListHabits = () => {
  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: () => dexieDb.habits.toArray(),
  });
};

export const useAddHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habitData: Omit<Habit, 'id'>) => {
      await dexieDb.habits.add(habitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
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

// Hooks for habit completions
export const useListHabitCompletions = (date: string) => {
  return useQuery({
    queryKey: [HABIT_COMPLETIONS_QUERY_KEY, date],
    queryFn: async () => {
      const completions = await dexieDb.habitCompletions
        .where('date')
        .equals(date)
        .toArray();
      return completions.map((completion: HabitCompletion) => completion.habitId);
    },
  });
};

export const useAddHabitCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: number; date: string }) => {
      await dexieDb.habitCompletions.add({ habitId, date });
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, date] 
      });
    },
  });
};

export const useDeleteHabitCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: number; date: string }) => {
      await dexieDb.habitCompletions.where({ habitId, date }).delete();
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, date] 
      });
    },
  });
};
