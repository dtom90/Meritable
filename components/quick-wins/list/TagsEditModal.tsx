import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import TagsEditList from './TagsEditList';
import TagsReorderPanel from './TagsReorderPanel';

type TagsEditModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function TagsEditModal({ visible, onClose }: TagsEditModalProps) {
  const [reorderMode, setReorderMode] = useState(false);

  useEffect(() => {
    if (!visible) setReorderMode(false);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.5)] p-6">
          <TouchableWithoutFeedback>
            <View
              className="min-h-0 w-full max-w-[400px] max-h-[80%] rounded-2xl bg-[#1C1C1E] p-5"
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-white">
                  Edit tags
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="h-8 w-8 items-center justify-center rounded-full bg-[#38383A]"
                >
                  <Text className="text-lg font-bold text-[#8E8E93]">
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
              <Pressable onPress={() => setReorderMode((v) => !v)} className="mb-2 self-start">
                <Text className="text-[#0A84FF]">
                  {reorderMode ? 'Done' : 'Reorder'}
                </Text>
              </Pressable>
              <View className="min-h-0">
                {reorderMode ? <TagsReorderPanel /> : <TagsEditList />}
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="mt-4 items-center rounded bg-[#0A84FF] py-3"
              >
                <Text className="text-base font-semibold text-white">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
