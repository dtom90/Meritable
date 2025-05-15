import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db, type Habit, type HabitCompletion } from '../db/database';

// Query keys
const HABITS_QUERY_KEY = 'habits';
const HABIT_COMPLETIONS_QUERY_KEY = 'habitCompletions';

// Hooks for habits
export const useHabits = () => {
  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: () => db.habits.toArray(),
  });
};

export const useAddHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habitData: Omit<Habit, 'id'>) => {
      await db.habits.add(habitData);
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
      await db.habits.delete(habitId);
      await db.habitCompletions.where('habitId').equals(habitId).delete();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [HABIT_COMPLETIONS_QUERY_KEY] });
    },
  });
};

// Hooks for habit completions
export const useHabitCompletions = (date: string) => {
  return useQuery({
    queryKey: [HABIT_COMPLETIONS_QUERY_KEY, date],
    queryFn: async () => {
      const completions = await db.habitCompletions
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
      await db.habitCompletions.add({ habitId, date });
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
      await db.habitCompletions.where({ habitId, date }).delete();
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, date] 
      });
    },
  });
};
