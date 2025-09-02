import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Habit, HabitCompletion, HabitInput } from './types'
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
    mutationFn: async (habitData: HabitInput) => {
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

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Habit> }) => {
      return await activeDb.updateHabit(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
  });
};

export const useReorderHabits = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  
  return useMutation({
    mutationFn: async (habits: Habit[]) => {
      return await activeDb.reorderHabits(habits);
    },
    onMutate: async (newHabits: Habit[]) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [HABITS_QUERY_KEY] });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData([HABITS_QUERY_KEY]);

      // Optimistically update to the new value
      queryClient.setQueryData([HABITS_QUERY_KEY], newHabits);

      // Return a context object with the snapshotted value
      return { previousHabits };
    },
    onError: (err, newHabits, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousHabits) {
        queryClient.setQueryData([HABITS_QUERY_KEY], context.previousHabits);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
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

export const useListHabitCompletionsByDate = (completionDate: string) => {
  const { activeDb } = useDataSource();
  
  return useQuery({
    queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate],
    queryFn: async () => {
      const completions = await activeDb.getHabitCompletionsByDate(completionDate);
      return completions.map((completion: HabitCompletion) => completion);
    },
  });
};

export const useListHabitCompletionsByHabitId = (habitId: number) => {
  const { activeDb } = useDataSource();
  
  return useQuery({
    queryKey: [HABIT_COMPLETIONS_QUERY_KEY, habitId],
    queryFn: async () => {
      const completions = await activeDb.getHabitCompletionsById(habitId);
      return completions.map((completion: HabitCompletion) => completion);
    },
  });
};

export const useDeleteHabitCompletion = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  
  return useMutation({
    mutationFn: async ({ id }: { id: number, completionDate: string }) => {
      await activeDb.deleteHabitCompletion(id);
    },
    onSuccess: (_, { completionDate }) => {
      queryClient.invalidateQueries({ 
        queryKey: [HABIT_COMPLETIONS_QUERY_KEY, completionDate] 
      });
    },
  });
};
