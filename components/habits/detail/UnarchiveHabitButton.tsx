import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { useUnarchiveHabit } from '@/db/useHabitDb';

export default function UnarchiveHabitButton({ habitId }: { habitId: number }) {
  const unarchiveHabitMutation = useUnarchiveHabit();
  const [showUnarchiveAlert, setShowUnarchiveAlert] = useState(false);

  const handleUnarchive = () => {
    setShowUnarchiveAlert(true);
  };

  const confirmUnarchive = async () => {
    if (habitId) {
      try {
        await unarchiveHabitMutation.mutateAsync(habitId);
        setShowUnarchiveAlert(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error unarchiving habit:', error);
        setShowUnarchiveAlert(false);
      }
    }
  };

  const cancelUnarchive = () => {
    setShowUnarchiveAlert(false);
  };

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center p-4 rounded-lg"
        style={{ backgroundColor: Colors.card }}
        onPress={handleUnarchive}
      >
        <Icon source="archive-arrow-up" color={Colors.primary} size={24} />
        <Text className="ml-3 text-lg" style={{ color: Colors.text }}>
          Unarchive habit
        </Text>
      </TouchableOpacity>

      {showUnarchiveAlert && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
          <View
            className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full"
            style={{ backgroundColor: Colors.surface }}
          >
            <Text
              className="text-xl font-bold mb-3 text-center"
              style={{ color: Colors.text }}
            >
              Unarchive Habit
            </Text>
            <Text
              className="text-base mb-6 text-center"
              style={{ color: Colors.textSecondary }}
            >
              Restore this habit to your active list?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.textTertiary }}
                onPress={cancelUnarchive}
              >
                <Text className="text-white font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.primary }}
                onPress={confirmUnarchive}
              >
                <Text className="text-white font-semibold text-base">
                  Unarchive
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
}
