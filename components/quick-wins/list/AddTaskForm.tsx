import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { useCreateTask } from '@/db/useTasks';
import { useCreateTag, useSetTaskTags } from '@/db/useTags';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { formatDate } from '@/lib/dateUtils';
import { TaskDetailTags } from '@/components/quick-wins/detail/TaskDetailTags';

export interface AddTaskFormRef {
  focus: () => void;
}

interface AddTaskFormProps {
  onSuccess?: () => void;
}

const AddTaskForm = forwardRef<AddTaskFormRef, AddTaskFormProps>(({ onSuccess }, ref) => {
  const { selectedDate } = useSelectedDate();
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTask = useCreateTask();
  const createTag = useCreateTag();
  const setTaskTags = useSetTaskTags();
  const titleInputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => titleInputRef.current?.focus(),
  }));

  const handleSubmit = async () => {
    if (isSubmitting || createTask.isPending || !taskTitle.trim()) return;
    const normalizedDue = formatDate(dueDate, selectedDate);
    setIsSubmitting(true);
    if (Platform.OS !== 'web') Keyboard.dismiss();
    try {
      const task = await createTask.mutateAsync({
        title: taskTitle.trim(),
        dueDate: normalizedDue,
      });
      if (tagNames.length > 0) {
        const tagIds: number[] = [];
        for (const name of tagNames) {
          const tag = await createTag.mutateAsync(name);
          tagIds.push(tag.id);
        }
        await setTaskTags.mutateAsync({ taskId: task.id, tagIds });
      }
      onSuccess?.();
    } catch {
      // leave form open on error
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="p-2.5 rounded"
          style={{ backgroundColor: Colors.card, color: Colors.text }}
          placeholder={selectedDate}
          placeholderTextColor={Colors.textSecondary}
          value={dueDate}
          onChangeText={setDueDate}
        />
      </View>
      <View className="mb-6">
        <TaskDetailTags value={tagNames} onChange={setTagNames} />
      </View>
      <TouchableOpacity
        className="py-3 rounded items-center"
        style={{
          backgroundColor: isSubmitting ? Colors.textTertiary : Colors.primary,
        }}
        onPress={handleSubmit}
        disabled={isSubmitting || createTask.isPending || !taskTitle.trim()}
      >
        <Text className="text-base font-bold" style={{ color: Colors.text }}>
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </Text>
      </TouchableOpacity>
    </>
  );
});

AddTaskForm.displayName = 'AddTaskForm';

export default AddTaskForm;
