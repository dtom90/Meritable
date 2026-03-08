import { useMemo, useRef, useEffect } from 'react';
import { useTasksForDate } from '@/db/useTasks';
import { useTaskTagIdsMap, useTagsQuery, useCreateTag } from '@/db/useTags';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { BACKLOG_TAG_NAME } from '@/lib/constants';
import { filterTasksForQuickWinsList } from './filterTasksForQuickWinsList';
export function useQuickWinsList(selectedTagId: number | null) {
  const hasEnsuredBacklog = useRef(false);
  const { selectedDate } = useSelectedDate();
  const { data: tasks, isLoading } = useTasksForDate(selectedDate);
  const { data: taskTagIdsMap = {}, isLoading: mapLoading } = useTaskTagIdsMap();
  const { data: tags = [] } = useTagsQuery();
  const createTag = useCreateTag();

  const backlogTag = useMemo(
    () => tags.find((t) => t.name === BACKLOG_TAG_NAME),
    [tags]
  );

  useEffect(() => {
    if (tags.length === 0 || hasEnsuredBacklog.current) return;
    if (tags.some((t) => t.name === BACKLOG_TAG_NAME)) {
      hasEnsuredBacklog.current = true;
      return;
    }
    hasEnsuredBacklog.current = true;
    createTag.mutate(BACKLOG_TAG_NAME);
  }, [tags, createTag]);

  const tasksFiltered = useMemo(
    () =>
      filterTasksForQuickWinsList(
        tasks,
        taskTagIdsMap,
        backlogTag ?? undefined,
        selectedTagId
      ),
    [tasks, selectedTagId, taskTagIdsMap, backlogTag]
  );

  const tagsInUse = useMemo(() => {
    const tagIdSet = new Set<number>();
    if (tasks?.length) {
      for (const t of tasks) {
        if (t.id != null && taskTagIdsMap[t.id]) {
          for (const id of taskTagIdsMap[t.id]) tagIdSet.add(id);
        }
      }
    }
    const inUse = tags.filter((tag) => tagIdSet.has(tag.id));
    if (backlogTag) {
      return [
        ...inUse.filter((t) => t.id !== backlogTag.id),
        backlogTag,
      ];
    }
    return inUse;
  }, [tasks, taskTagIdsMap, tags, backlogTag]);

  const getTaskTags = (taskId: number): { names: string[]; ids: number[] } => {
    const ids = (taskTagIdsMap[taskId] ?? []).slice();
    const orderMap = new Map(tags.map((t, i) => [t.id, i]));
    ids.sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0));
    const names = ids
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    return { names, ids };
  };

  return {
    tasksFiltered,
    tagsInUse,
    tags,
    getTaskTags,
    isLoading: isLoading || mapLoading,
  };
}
