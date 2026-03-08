import type { Task, Tag } from '@/db/types';
import { filterTasksForQuickWinsList } from '../filterTasksForQuickWinsList';

const mkTask = (id: number, title: string): Task => ({
  id,
  title,
  dueDate: '2025-01-15',
  completed: false,
  completionDate: null,
});

describe('filterTasksForQuickWinsList', () => {
  const backlogTag: Tag = { id: 1, name: 'Backlog', order: 0 };
  const workTag: Tag = { id: 2, name: 'Work', order: 1 };
  const task1 = mkTask(101, 'Task 1');
  const task2 = mkTask(102, 'Task 2');
  const task3 = mkTask(103, 'Task 3');

  it('when "All" is selected, excludes tasks that have the Backlog tag', () => {
    const tasks = [task1, task2, task3];
    const taskTagIdsMap: Record<number, number[]> = {
      101: [workTag.id],
      102: [backlogTag.id],
      103: [],
    };
    const result = filterTasksForQuickWinsList(
      tasks,
      taskTagIdsMap,
      backlogTag,
      null
    );
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual([101, 103]);
    expect(result.find((t) => t.id === 102)).toBeUndefined();
  });

  it('when another tag is selected, excludes tasks that have Backlog even if they have that tag', () => {
    const tasks = [task1, task2];
    const taskTagIdsMap: Record<number, number[]> = {
      101: [workTag.id],
      102: [backlogTag.id, workTag.id],
    };
    const result = filterTasksForQuickWinsList(
      tasks,
      taskTagIdsMap,
      backlogTag,
      workTag.id
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(101);
  });

  it('when Backlog is selected, returns only tasks that have the Backlog tag', () => {
    const tasks = [task1, task2, task3];
    const taskTagIdsMap: Record<number, number[]> = {
      101: [workTag.id],
      102: [backlogTag.id],
      103: [backlogTag.id],
    };
    const result = filterTasksForQuickWinsList(
      tasks,
      taskTagIdsMap,
      backlogTag,
      backlogTag.id
    );
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual([102, 103]);
  });

  it('returns empty array when tasks is null or undefined', () => {
    const map: Record<number, number[]> = {};
    expect(filterTasksForQuickWinsList(null, map, backlogTag, null)).toEqual(
      []
    );
    expect(
      filterTasksForQuickWinsList(undefined, map, backlogTag, null)
    ).toEqual([]);
  });

  it('when backlogTag is undefined, treats no task as Backlog', () => {
    const tasks = [task1, task2];
    const taskTagIdsMap: Record<number, number[]> = {
      101: [workTag.id],
      102: [workTag.id],
    };
    const result = filterTasksForQuickWinsList(
      tasks,
      taskTagIdsMap,
      undefined,
      null
    );
    expect(result).toHaveLength(2);
  });
});
