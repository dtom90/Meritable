import { useState } from 'react';
import { AddButton } from '@/components/common/AddButton';
import AddTaskModal from './AddTaskModal';

type AddTaskButtonProps = {
  initialTagId?: number | null;
};

export default function AddTaskButton({ initialTagId = null }: AddTaskButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <AddButton onPress={() => setModalVisible(true)} />
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Task"
        initialTagIds={initialTagId != null ? [initialTagId] : []}
      />
    </>
  );
}
