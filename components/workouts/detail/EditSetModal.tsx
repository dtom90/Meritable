import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from 'react-native';
import { Colors } from '@/lib/Colors';
import { useUpdateSet } from '@/db/useWorkoutDb';
import type { Set } from '@/db/habitDatabase';

type EditSetModalProps = {
  visible: boolean;
  set: Set | null;
  onClose: () => void;
};

export function EditSetModal({ visible, set: setToEdit, onClose }: EditSetModalProps) {
  const updateSet = useUpdateSet();
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  useEffect(() => {
    if (setToEdit) {
      setWeightInput(
        setToEdit.weight != null && setToEdit.weight > 0
          ? String(setToEdit.weight)
          : ''
      );
      setRepsInput(String(setToEdit.reps));
      setDateInput(setToEdit.completionDate ?? '');
    }
  }, [setToEdit, visible]);

  const handleSave = () => {
    if (!setToEdit) return;
    const reps = parseInt(repsInput.trim(), 10);
    if (Number.isNaN(reps) || reps < 1 || updateSet.isPending) return;
    const weight =
      weightInput.trim() === '' ? null : parseFloat(weightInput.trim());
    const weightNum =
      weight != null && !Number.isNaN(weight) && weight >= 0 ? weight : null;
    const completionDate = dateInput.trim() || setToEdit.completionDate;
    if (Platform.OS !== 'web') Keyboard.dismiss();
    updateSet.mutate(
      {
        id: setToEdit.id,
        exerciseId: setToEdit.exerciseId,
        updates: {
          weight: weightNum,
          reps,
          completionDate,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!setToEdit) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="flex-1 justify-center px-6"
          style={{ backgroundColor: Colors.overlay }}
        >
          <TouchableWithoutFeedback>
            <View
              className="rounded-xl p-5 gap-4"
              style={{ backgroundColor: Colors.surface }}
            >
              <Text
                className="text-lg font-semibold"
                style={{ color: Colors.text }}
              >
                Edit set
              </Text>
              <View className="gap-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  Weight (lbs)
                </Text>
                <TextInput
                  className="p-2.5 rounded"
                  style={{ backgroundColor: Colors.card, color: Colors.text }}
                  placeholder="Optional"
                  placeholderTextColor={Colors.textSecondary}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="gap-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  Reps *
                </Text>
                <TextInput
                  className="p-2.5 rounded"
                  style={{ backgroundColor: Colors.card, color: Colors.text }}
                  placeholder="Reps"
                  placeholderTextColor={Colors.textSecondary}
                  value={repsInput}
                  onChangeText={setRepsInput}
                  keyboardType="number-pad"
                />
              </View>
              <View className="gap-2">
                <Text
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  Date (YYYY-MM-DD)
                </Text>
                <TextInput
                  className="p-2.5 rounded"
                  style={{ backgroundColor: Colors.card, color: Colors.text }}
                  placeholder="2025-02-28"
                  placeholderTextColor={Colors.textSecondary}
                  value={dateInput}
                  onChangeText={setDateInput}
                />
              </View>
              <View className="flex-row gap-2 justify-end mt-2">
                <TouchableOpacity
                  className="py-2.5 px-4 rounded"
                  style={{ backgroundColor: Colors.card }}
                  onPress={onClose}
                >
                  <Text style={{ color: Colors.text }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-2.5 px-4 rounded"
                  style={{
                    backgroundColor: updateSet.isPending
                      ? Colors.textTertiary
                      : Colors.primary,
                  }}
                  onPress={handleSave}
                  disabled={
                    updateSet.isPending ||
                    !repsInput.trim() ||
                    parseInt(repsInput.trim(), 10) < 1
                  }
                >
                  <Text className="font-bold" style={{ color: Colors.text }}>
                    {updateSet.isPending ? '...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
