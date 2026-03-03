import { useState } from 'react';
import { AddButton } from '@/components/common/AddButton';
import { AddExerciseModal } from './AddExerciseModal';

export function AddExerciseButton() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <AddButton onPress={() => setModalVisible(true)} />
      <AddExerciseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Exercise"
      />
    </>
  );
}
