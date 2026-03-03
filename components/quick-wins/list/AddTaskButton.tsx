import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Colors } from '@/lib/Colors';
import { Ionicons } from '@expo/vector-icons';
import AddTaskModal from './AddTaskModal';

export default function AddTaskButton() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View className="flex-row items-center justify-center mb-2">
        <TouchableOpacity
          className="relative w-14 h-14 rounded-full justify-center items-center shadow-lg mb-4"
          style={{ backgroundColor: Colors.primary }}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Task"
      />
    </>
  );
}
