import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '@/lib/Colors';
import TagsReorderList from './TagsReorderList';

type TagsEditModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function TagsEditModal({ visible, onClose }: TagsEditModalProps) {
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
              <TagsReorderList />
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
