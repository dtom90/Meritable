import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Spinner from '@/components/common/Spinner';
import QuickWinButton from './QuickWinButton';
import { useTasksForDate } from '@/db/useTasks';
import { useTaskTagIdsMap, useTagsQuery } from '@/db/useTags';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { Colors } from '@/lib/Colors';

type QuickWinsListProps = {
  selectedTagId: number | null;
  onSelectTagId: (id: number | null) => void;
};

export default function QuickWinsList({
  selectedTagId,
  onSelectTagId,
}: QuickWinsListProps) {
  const { selectedDate } = useSelectedDate();
  const { data: tasks, isLoading } = useTasksForDate(selectedDate);
  const { data: taskTagIdsMap = {}, isLoading: mapLoading } = useTaskTagIdsMap();
  const { data: tags = [] } = useTagsQuery();

  const tasksFiltered = useMemo(() => {
    if (!tasks) return [];
    if (selectedTagId == null) return tasks;
    return tasks.filter((t) => {
      const ids = t.id != null ? taskTagIdsMap[t.id] : undefined;
      return ids?.includes(selectedTagId) ?? false;
    });
  }, [tasks, selectedTagId, taskTagIdsMap]);

  const tagsInUse = useMemo(() => {
    if (!tasks?.length) return [];
    const tagIdSet = new Set<number>();
    for (const t of tasks) {
      if (t.id != null && taskTagIdsMap[t.id]) {
        for (const id of taskTagIdsMap[t.id]) tagIdSet.add(id);
      }
    }
    return [...tagIdSet]
      .map((id) => tags.find((tag) => tag.id === id))
      .filter((t): t is NonNullable<typeof t> => t != null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, taskTagIdsMap, tags]);

  const getTagNamesForTask = (taskId: number): string[] => {
    const ids = taskTagIdsMap[taskId] ?? [];
    return ids
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter((n): n is string => Boolean(n));
  };

  if (isLoading || mapLoading) {
    return <Spinner />;
  }

  return (
    <View>
      {(tagsInUse.length > 0 || selectedTagId != null) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row items-center gap-2 mb-3"
        >
          <TouchableOpacity
            onPress={() => onSelectTagId(null)}
            className="px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: selectedTagId === null ? Colors.primary : Colors.card,
            }}
          >
            <Text className="text-sm" style={{ color: Colors.text }}>
              All
            </Text>
          </TouchableOpacity>
          {tagsInUse.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              onPress={() => onSelectTagId(tag.id)}
              className="px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: selectedTagId === tag.id ? Colors.primary : Colors.card,
              }}
            >
              <Text className="text-sm" style={{ color: Colors.text }}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {tasksFiltered && tasksFiltered.length > 0 ? (
        tasksFiltered.map((task, index) => (
          <QuickWinButton
            key={task.id ?? `task-${index}`}
            task={task}
            tagNames={task.id != null ? getTagNamesForTask(task.id) : []}
          />
        ))
      ) : (
        <View />
      )}
    </View>
  );
}
