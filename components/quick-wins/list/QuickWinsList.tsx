import { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Spinner from '@/components/common/Spinner';
import QuickWinButton from './QuickWinButton';
import TagOrderModal from './TagOrderModal';
import { useTasksForDate } from '@/db/useTasks';
import { useTaskTagIdsMap, useTagsQuery, useCreateTag } from '@/db/useTags';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { Colors } from '@/lib/Colors';
import { BACKLOG_TAG_NAME } from '@/lib/constants';
import { filterTasksForQuickWinsList } from './filterTasksForQuickWinsList';

type QuickWinsListProps = {
  selectedTagId: number | null;
  onSelectTagId: (id: number | null) => void;
};

export default function QuickWinsList({
  selectedTagId,
  onSelectTagId,
}: QuickWinsListProps) {
  const [tagOrderModalVisible, setTagOrderModalVisible] = useState(false);
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

  // Ensure the Backlog tag is created if it doesn't exist
  useEffect(() => {
    if (tags.length === 0 || hasEnsuredBacklog.current) return;
    if (tags.some((t) => t.name === BACKLOG_TAG_NAME)) {
      hasEnsuredBacklog.current = true;
      return;
    }
    hasEnsuredBacklog.current = true;
    createTag.mutate(BACKLOG_TAG_NAME);
  }, [tags, createTag]);

  // Filter tasks based on selected tag and Backlog rules
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

  // Get tags in use (excluding Backlog if selected)
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
        backlogTag
      ];
    }
    return inUse;
  }, [tasks, taskTagIdsMap, tags, backlogTag]);

  // Get tags for a task
  const getTaskTags = (taskId: number): { names: string[]; ids: number[] } => {
    const ids = (taskTagIdsMap[taskId] ?? []).slice();
    const orderMap = new Map(tags.map((t, i) => [t.id, i]));
    ids.sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0));
    const names = ids
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    return { names, ids };
  };

  if (isLoading || mapLoading) {
    return <Spinner />;
  }

  return (
    <View>
      {(tagsInUse.length > 0 || selectedTagId != null || tags.length > 0) && (
        <View className="flex-row items-center gap-3 mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row items-center gap-3 flex-1"
          >
            <TouchableOpacity
              onPress={() => onSelectTagId(null)}
              className="px-3 py-1.5 rounded-full mr-2"
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
                className="px-3 py-1.5 rounded-full mr-2"
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
            taskTags={task.id != null ? getTaskTags(task.id) : { names: [], ids: [] }}
            selectedTagId={selectedTagId}
          />
        ))
      ) : (
        <View />
      )}
    </View>
  );
}
