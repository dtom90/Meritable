import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '@/lib/Colors';
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
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              className="min-h-0"
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 20,
                width: '100%',
                maxWidth: 400,
                maxHeight: '80%',
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold" style={{ color: Colors.text }}>
                  Edit tags
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  className="w-8 h-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: Colors.border }}
                >
                  <Text className="text-lg font-bold" style={{ color: Colors.textSecondary }}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
              <Pressable onPress={() => setReorderMode((v) => !v)} className="mb-2 self-start">
                <Text style={{ color: Colors.primary }}>
                  {reorderMode ? 'Done' : 'Reorder'}
                </Text>
              </Pressable>
              <View className="min-h-0">
                {reorderMode ? <TagsReorderPanel /> : <TagsEditList />}
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="mt-4 py-3 rounded items-center"
                style={{ backgroundColor: Colors.primary }}
              >
                <Text className="text-base font-semibold" style={{ color: Colors.text }}>
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
