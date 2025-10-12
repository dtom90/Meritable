import { useState } from 'react';
import { TouchableOpacity, View, Text, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { Ionicons } from '@expo/vector-icons';
import HabitInputModal from './HabitInputModal';

export default function AddHabitButton({ withTooltip }: { withTooltip: boolean }) {
  const [fabHovered, setFabHovered] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const button = (
    <TouchableOpacity
      className="relative w-16 h-16 rounded-full justify-center items-center shadow-lg"
      style={{ backgroundColor: Colors.primary }}
      onPress={() => setModalVisible(true)}
      activeOpacity={0.8}
      {...(withTooltip && Platform.OS === 'web' ? {
        onMouseEnter: () => setFabHovered(true),
        onMouseLeave: () => setFabHovered(false),
      } : {})}
    >
      <Ionicons name="add" size={40} color={Colors.text} />
    </TouchableOpacity>
  )

  return (
    <>
      {withTooltip ? (
        <View className="absolute right-6 bottom-6 flex-row items-center">
          {fabHovered && (
            <View className="mr-4 py-1 px-3 rounded-lg shadow-md z-10 self-center" style={{ backgroundColor: Colors.card }}>
              <Text className="text-base font-medium p-2" style={{ color: Colors.text }}>Add Habit</Text>
            </View>
          )}
          {button}
        </View>
      ) : (
        <View className="right-flex-row items-center mb-4">
          {button}
        </View>
      )}
      
      <HabitInputModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add New Habit"
      />
    </>
  )
}
