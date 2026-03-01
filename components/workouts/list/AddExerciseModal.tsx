import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Colors } from '@/lib/Colors';
import { useCreateExercise } from '@/db/useWorkoutDb';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

const { height: screenHeight } = Dimensions.get('window');

export function AddExerciseModal({
  visible,
  onClose,
  title = 'Add Exercise',
}: AddExerciseModalProps) {
  const [modalVisible, setModalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [newName, setNewName] = useState('');
  const createExercise = useCreateExercise();

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setNewName('');
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
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

  const handleAddExercise = () => {
    const name = newName.trim();
    if (!name || createExercise.isPending) return;
    if (Platform.OS !== 'web') Keyboard.dismiss();
    createExercise.mutate(
      { name },
      {
        onSuccess: () => {
          setNewName('');
          handleClose();
        },
      }
    );
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

                <View className="flex-row mb-2">
                  <TextInput
                    className="flex-1 p-2.5 mr-2.5 rounded"
                    style={{ backgroundColor: Colors.card, color: Colors.text }}
                    placeholder="Exercise name..."
                    value={newName}
                    onChangeText={setNewName}
                    onSubmitEditing={handleAddExercise}
                    placeholderTextColor={Colors.textSecondary}
                    autoFocus
                  />
                  <TouchableOpacity
                    className="py-3 px-5 rounded items-center"
                    style={{
                      backgroundColor: createExercise.isPending
                        ? Colors.textTertiary
                        : Colors.primary,
                    }}
                    onPress={handleAddExercise}
                    disabled={createExercise.isPending}
                  >
                    <Text
                      className="text-base font-bold"
                      style={{ color: Colors.text }}
                    >
                      {createExercise.isPending ? 'Adding...' : 'Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
