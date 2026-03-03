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
import { useSelectedDate } from '@/lib/selectedDateStore';
import { formatDate } from '@/lib/dateUtils';

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
  const createTask = useCreateTask();
  const isSubmittingRef = useRef(false);
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTaskTitle('');
      setDueDate(selectedDate);
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

  const handleSubmit = () => {
    if (isSubmittingRef.current || createTask.isPending || !taskTitle.trim()) return;
    const normalizedDue = formatDate(dueDate, selectedDate);
    isSubmittingRef.current = true;
    if (Platform.OS !== 'web') Keyboard.dismiss();
    createTask.mutate(
      { title: taskTitle.trim(), dueDate: normalizedDue },
      {
        onSuccess: () => {
          isSubmittingRef.current = false;
          onClose();
        },
        onError: () => {
          isSubmittingRef.current = false;
        },
      }
    );
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
                <View className="mb-6">
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
                <TouchableOpacity
                  className="py-3 rounded items-center"
                  style={{
                    backgroundColor: createTask.isPending ? Colors.textTertiary : Colors.primary,
                  }}
                  onPress={handleSubmit}
                  disabled={createTask.isPending || !taskTitle.trim()}
                >
                  <Text className="text-base font-bold" style={{ color: Colors.text }}>
                    {createTask.isPending ? 'Adding...' : 'Add Task'}
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
