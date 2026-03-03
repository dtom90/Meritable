import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDataSource } from '@/db/DataSourceContext';
import type { Tag } from './types';

const TAGS_QUERY_KEY = 'tags';
const TASK_TAG_IDS_MAP_QUERY_KEY = 'taskTagIdsMap';

export function tagsQueryKey() {
  return [TAGS_QUERY_KEY] as const;
}

export function taskTagIdsKey(taskId: number) {
  return ['taskTagIds', taskId] as const;
}

export function taskTagIdsMapQueryKey() {
  return [TASK_TAG_IDS_MAP_QUERY_KEY] as const;
}

/**
 * All tags for the current user / local store.
 */
export function useTagsQuery() {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: tagsQueryKey(),
    queryFn: () => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.getTags();
    },
    enabled: isInitialized && !!activeDb,
  });
}

/**
 * Tag IDs for a single task (e.g. task detail).
 */
export function useTaskTagIds(taskId: number | undefined) {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: taskId != null ? taskTagIdsKey(taskId) : ['taskTagIds', null],
    queryFn: () => {
      if (!activeDb || taskId == null) throw new Error('Database or taskId not available');
      return activeDb.getTaskTagIds(taskId);
    },
    enabled: isInitialized && !!activeDb && taskId != null,
  });
}

/**
 * Map of taskId -> tagIds for all tasks (e.g. list filter + chips).
 */
export function useTaskTagIdsMap() {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: taskTagIdsMapQueryKey(),
    queryFn: () => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.getTaskTagIdsMap();
    },
    enabled: isInitialized && !!activeDb,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.createTag(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKey() });
      queryClient.invalidateQueries({ queryKey: taskTagIdsMapQueryKey() });
    },
  });
}

export function useReorderTags() {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();

  return useMutation({
    mutationFn: async (tags: Tag[]) => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.reorderTags(tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKey() });
      queryClient.invalidateQueries({ queryKey: taskTagIdsMapQueryKey() });
    },
  });
}

export function useSetTaskTags() {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();

  return useMutation({
    mutationFn: async ({ taskId, tagIds }: { taskId: number; tagIds: number[] }) => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.setTaskTags(taskId, tagIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskTagIdsMapQueryKey() });
      queryClient.invalidateQueries({ queryKey: taskTagIdsKey(variables.taskId) });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!activeDb) throw new Error('Database not initialized');
      await activeDb.deleteTag(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsQueryKey() });
      queryClient.invalidateQueries({ queryKey: taskTagIdsMapQueryKey() });
    },
  });
}
