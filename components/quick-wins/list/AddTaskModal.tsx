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
} from 'react-native';
import { Colors } from '@/lib/Colors';
import AddTaskForm, { AddTaskFormRef } from './AddTaskForm';

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
  const formRef = useRef<AddTaskFormRef>(null);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      let focusTimer: ReturnType<typeof setTimeout> | undefined;
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        focusTimer = setTimeout(() => formRef.current?.focus(), 350);
      });
      return () => {
        if (focusTimer != null) clearTimeout(focusTimer);
      };
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, slideAnim]);

  const handleClose = () => onClose();

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

                <AddTaskForm
                  key={visible ? 'open' : 'closed'}
                  ref={formRef}
                  onSuccess={handleClose}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
