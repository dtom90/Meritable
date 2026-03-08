import type { Task, Tag } from '@/db/types';

/**
 * Filters tasks for the Quick Wins list based on selected tag and Backlog rules.
 * - "All" (selectedTagId null): exclude tasks that have the Backlog tag.
 * - Backlog selected: only tasks that have the Backlog tag.
 * - Other tag selected: only tasks that have that tag and do not have the Backlog tag.
 */
export function filterTasksForQuickWinsList(
  tasks: Task[] | null | undefined,
  taskTagIdsMap: Record<number, number[]>,
  backlogTag: Tag | undefined,
  selectedTagId: number | null
): Task[] {
  if (!tasks) return [];
  const hasBacklog = (task: Task) =>
    task.id != null &&
    backlogTag != null &&
    (taskTagIdsMap[task.id] ?? []).includes(backlogTag.id);
  if (selectedTagId == null) {
    return tasks.filter((t) => !hasBacklog(t));
  }
  if (backlogTag != null && selectedTagId === backlogTag.id) {
    return tasks.filter((t) => hasBacklog(t));
  }
  return tasks.filter((t) => {
    const ids = t.id != null ? taskTagIdsMap[t.id] : undefined;
    return (ids?.includes(selectedTagId) ?? false) && !hasBacklog(t);
  });
}
