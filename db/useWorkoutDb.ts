import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Exercise } from './types';
import { ExerciseInput, SetInput } from './types';
import { useDataSource } from '@/db/DataSourceContext';

const EXERCISES_QUERY_KEY = 'exercises';
export const SETS_QUERY_KEY = 'sets';

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

export const useListArchivedExercises = () => {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: [EXERCISES_QUERY_KEY, 'archived'],
    queryFn: () => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.getArchivedExercises();
    },
    enabled: isInitialized && !!activeDb,
  });
};

export const useExercise = (exerciseId: number | undefined) => {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: [EXERCISES_QUERY_KEY, 'exercise', exerciseId],
    queryFn: async () => {
      if (!activeDb || exerciseId == null) return null;
      return await activeDb.getExercise(exerciseId);
    },
    enabled: isInitialized && !!activeDb && exerciseId != null,
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY, 'exercise', id] });
    },
  });
};

export const useArchiveExercise = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async (exerciseId: number) => {
      if (!activeDb) throw new Error('Database not initialized');
      return await activeDb.updateExercise(exerciseId, { archived: true });
    },
    onSuccess: (_, exerciseId) => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY, 'archived'] });
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY, 'exercise', exerciseId] });
    },
  });
};

export const useUnarchiveExercise = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async (exerciseId: number) => {
      if (!activeDb) throw new Error('Database not initialized');
      return await activeDb.updateExercise(exerciseId, { archived: false });
    },
    onSuccess: (_, exerciseId) => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY, 'archived'] });
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY, 'exercise', exerciseId] });
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

export const useReorderExercises = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async (exercises: Exercise[]) => {
      if (!activeDb) throw new Error('Database not initialized');
      return await activeDb.reorderExercises(exercises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXERCISES_QUERY_KEY] });
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

export const useUpdateSet = () => {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();
  return useMutation({
    mutationFn: async ({
      id,
      exerciseId,
      updates,
    }: {
      id: number;
      exerciseId: number;
      updates: Partial<SetInput>;
    }) => {
      if (!activeDb) throw new Error('Database not initialized');
      return await activeDb.updateSet(id, updates);
    },
    onSuccess: (_, { exerciseId }) => {
      queryClient.invalidateQueries({ queryKey: [SETS_QUERY_KEY, exerciseId] });
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
