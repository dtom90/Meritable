import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit, HabitCompletion } from './types'
import { useDataSource } from '@/contexts/DataSourceContext';

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
  const { activeDb } = useDataSource();
  
  return useMutation({
    mutationFn: async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
      await activeDb.createHabit(habitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
  });
};

export const useListHabits = () => {
  const { activeDb } = useDataSource();
  
  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: () => activeDb.getHabits(),
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  
  return useMutation({
    mutationFn: async (habitId: number) => {
      await activeDb.deleteHabit(habitId);
      await activeDb.deleteHabitCompletion(habitId);
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
  const { activeDb } = useDataSource();
  
  return useMutation({
    mutationFn: async ({ habitId, completionDate }: { habitId: number; completionDate: string }) => {
      await activeDb.createHabitCompletion({ habitId, completionDate });
    },
    onSuccess: (_, { completionDate }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate] 
      });
    },
  });
};

export const useListHabitCompletions = (completionDate: string) => {
  const { activeDb } = useDataSource();
  
  return useQuery({
    queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate],
    queryFn: async () => {
      const completions = await activeDb.getHabitCompletions(completionDate);
      console.log('completions', completions);
      return completions.map((completion: HabitCompletion) => completion.habitId);
    },
  });
};

export const useDeleteHabitCompletion = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  
  return useMutation({
    mutationFn: async ({ habitId, completionDate }: { habitId: number; completionDate: string }) => {
      await activeDb.deleteHabitCompletion(habitId);
    },
    onSuccess: (_, { completionDate }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate] 
      });
    },
  });
};
