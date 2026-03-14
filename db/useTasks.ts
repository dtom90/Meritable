import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, TaskInput } from './types';
import { useDataSource } from '@/db/DataSourceContext';
import { getToday, toDateString } from '@/lib/dateUtils';

const TASKS_QUERY_KEY = 'tasks';

/**
 * Filter tasks to those relevant for the selected date (same logic as former fetchQuickWinsReminders).
 * - Only tasks with a due date are shown.
 * - Complete: show when completionDate === selectedDate.
 * - Incomplete: previous days = due <= selected; today = due <= selected; future = due === selected.
 */
export function filterTasksForDate(tasks: Task[], selectedDate: string): Task[] {
  const todayStr = getToday();
  return tasks.filter((t) => {
    const dueStr = toDateString(t.dueDate);
    const completionStr = t.completionDate ? toDateString(t.completionDate) : null;
    if (dueStr == null) return false;

    const completeOnSelected =
      t.completed === true && completionStr != null && completionStr === selectedDate;
    if (completeOnSelected) return true;

    if (t.completed === true) return false;
    if (selectedDate < todayStr) return dueStr <= selectedDate;
    if (selectedDate === todayStr) return dueStr <= selectedDate;
    return dueStr === selectedDate;
  });
}

/**
 * React Query hook for all tasks (used by useTasksForDate).
 */
export function useTasksQuery() {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: [TASKS_QUERY_KEY],
    queryFn: () => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.getTasks();
    },
    enabled: isInitialized && !!activeDb,
  });
}

/**
 * Tasks relevant for the given date (Quick Wins list).
 */
export function useTasksForDate(selectedDate: string) {
  const query = useTasksQuery();
  const tasks = query.data ?? [];
  const tasksForDate = filterTasksForDate(tasks, selectedDate);
  return {
    ...query,
    data: tasksForDate,
    tasksForDate,
    invalidate: query.refetch,
  };
}

/**
 * Single task by id (for detail screen).
 */
export function useTask(taskId: number | undefined) {
  const { activeDb, isInitialized } = useDataSource();
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => {
      if (!activeDb || taskId == null) throw new Error('Database or taskId not available');
      return activeDb.getTask(taskId);
    },
    enabled: isInitialized && !!activeDb && taskId != null,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();

  return useMutation({
    mutationFn: async (input: { title: string; dueDate: string }) => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.createTask({
        title: input.title,
        dueDate: input.dueDate,
        completed: false,
        completionDate: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<TaskInput>;
    }) => {
      if (!activeDb) throw new Error('Database not initialized');
      return activeDb.updateTask(id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { activeDb } = useDataSource();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!activeDb) throw new Error('Database not initialized');
      await activeDb.deleteTask(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });
}

export const tasksQueryKey = [TASKS_QUERY_KEY];
