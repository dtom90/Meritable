import { useState } from 'react';
import { AddButton } from '@/components/common/AddButton';
import AddTaskModal from './AddTaskModal';

export default function AddTaskButton() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <AddButton onPress={() => setModalVisible(true)} />
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Task"
      />
    </>
  );
}
