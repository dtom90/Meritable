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
import HabitInputForm, { HabitInputFormRef } from './HabitInputForm';

interface HabitInputModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export default function HabitInputModal({ 
  visible, 
  onClose, 
  title = "Add New Habit" 
}: HabitInputModalProps) {
  const [modalVisible, setModalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const habitInputFormRef = useRef<HabitInputFormRef>(null);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Focus the text input after the modal animation completes
        setTimeout(() => {
          habitInputFormRef.current?.focus();
        }, 100);
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    onClose();
  };

  const handleBackdropPress = () => {
    handleClose();
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
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View 
            style={{ 
              flex: 1, 
              backgroundColor: Colors.overlay,
              justifyContent: 'flex-end'
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
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                  <Text 
                    className="text-xl font-bold"
                    style={{ color: Colors.text }}
                  >
                    {title}
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="w-8 h-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: Colors.border }}
                  >
                    <Text 
                      className="text-lg font-bold"
                      style={{ color: Colors.textSecondary }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>

                <HabitInputForm ref={habitInputFormRef} onSuccess={handleClose} />

              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
