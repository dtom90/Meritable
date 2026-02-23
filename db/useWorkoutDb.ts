import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExerciseInput, SetInput } from './habitDatabase';
import { useDataSource } from '@/db/DataSourceContext';

const EXERCISES_QUERY_KEY = 'exercises';
const SETS_QUERY_KEY = 'sets';

export const useListExercises = () => {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: [EXERCISES_QUERY_KEY],
    queryFn: () => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.getExercises();
    },
    enabled: isInitialized && !!activeDb,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      if (!activeDb) throw new Error('Database not initialized');
      return await activeDb.createExercise(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<ExerciseInput> }) => {
      if (!activeDb) throw new Error('Database not initialized');
      return await activeDb.updateExercise(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!activeDb) throw new Error('Database not initialized');
      await activeDb.deleteExercise(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SETS_QUERY_KEY] });
    },
  });
};

export const useListSetsByExerciseId = (exerciseId: number) => {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: [SETS_QUERY_KEY, exerciseId],
    queryFn: () => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.getSetsByExerciseId(exerciseId);
    },
    enabled: isInitialized && !!activeDb && !!exerciseId,
  });
};

export const useCreateSet = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async (data: SetInput) => {
      if (!activeDb) throw new Error('Database not initialized');
      return await activeDb.createSet(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SETS_QUERY_KEY, variables.exerciseId] });
    },
  });
};

export const useDeleteSet = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async ({ id, exerciseId }: { id: number; exerciseId: number }) => {
      if (!activeDb) throw new Error('Database not initialized');
      await activeDb.deleteSet(id);
    },
    onSuccess: (_, { exerciseId }) => {
      queryClient.invalidateQueries({ queryKey: [SETS_QUERY_KEY, exerciseId] });
    },
  });
};
