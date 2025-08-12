import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DexieDb } from './dexieDb';
import { SupabaseDb } from './supabaseDb';
import { Habit, HabitCompletion } from './types'

const dexieDb = new DexieDb();
const supabaseDb = new SupabaseDb();

// const selectedDb = dexieDb;
const selectedDb = supabaseDb;

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
    mutationFn: async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
      await selectedDb.createHabit(habitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
  });
};

export const useListHabits = () => {
  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: () => selectedDb.getHabits(),
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habitId: number) => {
      await selectedDb.deleteHabit(habitId);
      await selectedDb.deleteHabitCompletion(habitId);
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
      await selectedDb.createHabitCompletion({ habitId, completionDate });
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
      const completions = await selectedDb.getHabitCompletions();
      return completions.map((completion: HabitCompletion) => completion.habitId);
    },
  });
};

export const useDeleteHabitCompletion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ habitId, completionDate }: { habitId: number; completionDate: string }) => {
      await selectedDb.deleteHabitCompletion(habitId);
    },
    onSuccess: (_, { completionDate }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate] 
      });
    },
  });
};
