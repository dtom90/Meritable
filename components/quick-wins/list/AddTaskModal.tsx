import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import { Colors } from '@/lib/Colors';
import { useCreateTask } from '@/db/useTasks';
import { useCreateTag, useSetTaskTags } from '@/db/useTags';
import { useSelectedDate } from '@/lib/selectedDateStore';
import { formatDate } from '@/lib/dateUtils';

function parseTagNames(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export default function AddTaskModal({
  visible,
  onClose,
  title = 'Add Task',
}: AddTaskModalProps) {
  const [modalVisible, setModalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const { selectedDate } = useSelectedDate();
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [tagNamesStr, setTagNamesStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTask = useCreateTask();
  const createTag = useCreateTag();
  const setTaskTags = useSetTaskTags();
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTaskTitle('');
      setDueDate(selectedDate);
      setTagNamesStr('');
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      const focusTimer = setTimeout(() => titleInputRef.current?.focus(), 350);
      return () => clearTimeout(focusTimer);
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, slideAnim, selectedDate]);

  const handleClose = () => onClose();

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
      const tagNames = parseTagNames(tagNamesStr);
      if (tagNames.length > 0) {
        const tagIds: number[] = [];
        for (const name of tagNames) {
          const tag = await createTag.mutateAsync(name);
          tagIds.push(tag.id);
        }
        await setTaskTags.mutateAsync({ taskId: task.id, tagIds });
      }
      onClose();
    } catch {
      // leave modal open on error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.overlay,
              justifyContent: 'flex-end',
            }}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={{
                  transform: [{ translateY: slideAnim }],
                  backgroundColor: Colors.surface,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingTop: 20,
                  paddingHorizontal: 20,
                  paddingBottom: 40,
                  minHeight: 200,
                }}
              >
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-bold" style={{ color: Colors.text }}>
                    {title}
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="w-8 h-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: Colors.border }}
                  >
                    <Text className="text-lg font-bold" style={{ color: Colors.textSecondary }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>

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
                  <Text className="text-sm mb-1" style={{ color: Colors.textSecondary }}>
                    Tags (comma-separated)
                  </Text>
                  <TextInput
                    className="p-2.5 rounded"
                    style={{ backgroundColor: Colors.card, color: Colors.text }}
                    placeholder="e.g. work, errands"
                    placeholderTextColor={Colors.textSecondary}
                    value={tagNamesStr}
                    onChangeText={setTagNamesStr}
                  />
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
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
