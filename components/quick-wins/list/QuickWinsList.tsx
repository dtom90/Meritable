import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Spinner from '@/components/common/Spinner';
import QuickWinButton from './QuickWinButton';
import TagOrderModal from './TagOrderModal';
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
  const [tagOrderModalVisible, setTagOrderModalVisible] = useState(false);
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
    return tags.filter((tag) => tagIdSet.has(tag.id));
  }, [tasks, taskTagIdsMap, tags]);

  const getTagNamesForTask = (taskId: number): string[] => {
    const ids = taskTagIdsMap[taskId] ?? [];
    const orderMap = new Map(tags.map((t, i) => [t.id, i]));
    return ids
      .slice()
      .sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0))
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter((n): n is string => Boolean(n));
  };

  if (isLoading || mapLoading) {
    return <Spinner />;
  }

  return (
    <View>
      {(tagsInUse.length > 0 || selectedTagId != null || tags.length > 0) && (
        <View className="flex-row items-center gap-2 mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row items-center gap-2 flex-1"
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
          {tags.length > 0 && (
            <TouchableOpacity
              onPress={() => setTagOrderModalVisible(true)}
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: Colors.border }}
            >
              <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                Reorder tags
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <TagOrderModal
        visible={tagOrderModalVisible}
        onClose={() => setTagOrderModalVisible(false)}
      />
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
