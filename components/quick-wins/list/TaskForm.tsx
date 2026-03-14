import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useCreateTask, useUpdateTask } from '@/db/useTasks';
import { useCreateTag, useSetTaskTags, useTaskTagIds, useTagsQuery } from '@/db/useTags';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { formatDate, toDateString } from '@/lib/dateUtils';
import { TaskDetailTags } from '@/components/quick-wins/detail/TaskDetailTags';
import type { Task } from '@/db/types';

export interface TaskFormRef {
  focus: (field?: 'title' | 'date') => void;
}

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

const TaskForm = forwardRef<TaskFormRef, TaskFormProps>(({ task, onSuccess }, ref) => {
  const { selectedDate } = useSelectedDate();
  const isEdit = task != null;

  const [taskTitle, setTaskTitle] = useState(isEdit ? task.title : '');
  const [dueDate, setDueDate] = useState(
    isEdit ? (toDateString(task.dueDate) ?? task.dueDate) : selectedDate
  );
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tagNamesInitialized, setTagNamesInitialized] = useState(!isEdit);

  const { data: tagIds = [] } = useTaskTagIds(isEdit ? task!.id : undefined);
  const { data: tags = [] } = useTagsQuery();

  useEffect(() => {
    if (!isEdit) return;
    const names = tagIds
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter((n): n is string => Boolean(n));
    setTagNames(names);
    setTagNamesInitialized(true);
  }, [isEdit, tagIds, tags]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const createTag = useCreateTag();
  const setTaskTags = useSetTaskTags();
  const titleInputRef = useRef<TextInput>(null);
  const dateInputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: (field?: 'title' | 'date') => {
      if (field === 'date') {
        dateInputRef.current?.focus();
      } else {
        titleInputRef.current?.focus();
      }
    },
  }));

  const handleSubmit = async () => {
    if (isSubmitting || !taskTitle.trim()) return;
    if (isEdit && (updateTask.isPending || !task.id)) return;
    if (!isEdit && createTask.isPending) return;

    const normalizedDue = formatDate(dueDate, selectedDate);
    setIsSubmitting(true);
    if (Platform.OS !== 'web') Keyboard.dismiss();

    try {
      if (isEdit) {
        await updateTask.mutateAsync({
          id: task.id,
          updates: { title: taskTitle.trim(), dueDate: normalizedDue },
        });
        const tagIdsToSet: number[] = [];
        for (const name of tagNames) {
          const existing = tags.find((t) => t.name === name);
          if (existing) {
            tagIdsToSet.push(existing.id);
          } else {
            const tag = await createTag.mutateAsync(name);
            tagIdsToSet.push(tag.id);
          }
        }
        await setTaskTags.mutateAsync({ taskId: task.id, tagIds: tagIdsToSet });
      } else {
        const newTask = await createTask.mutateAsync({
          title: taskTitle.trim(),
          dueDate: normalizedDue,
        });
        if (tagNames.length > 0) {
          const tagIdsToSet: number[] = [];
          for (const name of tagNames) {
            const tag = await createTag.mutateAsync(name);
            tagIdsToSet.push(tag.id);
          }
          await setTaskTags.mutateAsync({ taskId: newTask.id, tagIds: tagIdsToSet });
        }
      }
      onSuccess?.();
    } catch {
      // leave form open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const pending = isEdit ? updateTask.isPending : createTask.isPending;
  const submitLabel = isEdit
    ? isSubmitting || pending
      ? 'Saving...'
      : 'Save'
    : isSubmitting || pending
      ? 'Adding...'
      : 'Add Task';

  return (
    <>
      <View className="mb-4">
        <Text className="text-sm mb-1" style={{ color: Colors.textSecondary }}>
          Title
        </Text>
        <TextInput
          ref={titleInputRef}
          className="p-2.5 rounded"
          style={{ backgroundColor: Colors.card, color: Colors.text }}
          placeholder="Task title"
          placeholderTextColor={Colors.textSecondary}
          value={taskTitle}
          onChangeText={setTaskTitle}
          onSubmitEditing={handleSubmit}
          autoFocus
        />
      </View>
      <View className="mb-4">
        <Text className="text-sm mb-1" style={{ color: Colors.textSecondary }}>
          Due date (YYYY-MM-DD)
        </Text>
        <TextInput
          ref={dateInputRef}
          className="p-2.5 rounded"
          style={{ backgroundColor: Colors.card, color: Colors.text }}
          placeholder={selectedDate}
          placeholderTextColor={Colors.textSecondary}
          value={dueDate}
          onChangeText={setDueDate}
          onSubmitEditing={handleSubmit}
        />
      </View>
      <View className="mb-6">
        <TaskDetailTags value={tagNames} onChange={setTagNames} />
      </View>
      <TouchableOpacity
        className="py-3 rounded items-center"
        style={{
          backgroundColor: isSubmitting || pending ? Colors.textTertiary : Colors.primary,
        }}
        onPress={handleSubmit}
        disabled={
          isSubmitting ||
          pending ||
          !taskTitle.trim() ||
          (isEdit && !tagNamesInitialized)
        }
      >
        <Text className="text-base font-bold" style={{ color: Colors.text }}>
          {submitLabel}
        </Text>
      </TouchableOpacity>
    </>
  );
});

TaskForm.displayName = 'TaskForm';

export default TaskForm;
