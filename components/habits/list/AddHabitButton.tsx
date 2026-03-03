import { useState } from 'react';
import { AddButton } from '@/components/common/AddButton';
import HabitInputModal from './HabitInputModal';

export default function AddHabitButton() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <AddButton onPress={() => setModalVisible(true)} />
      <HabitInputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add New Habit"
      />
    </>
  );
}
