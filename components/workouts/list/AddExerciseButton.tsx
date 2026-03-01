import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Colors } from '@/lib/Colors';
import { Ionicons } from '@expo/vector-icons';
import { AddExerciseModal } from './AddExerciseModal';

export function AddExerciseButton() {
  const [modalVisible, setModalVisible] = useState(false);

  const button = (
    <TouchableOpacity
      className="relative w-16 h-16 rounded-full justify-center items-center shadow-lg"
      style={{ backgroundColor: Colors.primary }}
      onPress={() => setModalVisible(true)}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={40} color={Colors.text} />
    </TouchableOpacity>
  );

  return (
    <>
      <View className="items-center my-4">{button}</View>
      <AddExerciseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Exercise"
      />
    </>
  );
}
