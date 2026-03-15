import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { useArchiveHabit } from '@/db/useHabitDb';

export default function ArchiveHabitButton({ habitId }: { habitId: number }) {
  const router = useRouter();
  const archiveHabitMutation = useArchiveHabit();
  const [showArchiveAlert, setShowArchiveAlert] = useState(false);

  const handleArchive = () => {
    setShowArchiveAlert(true);
  };

  const confirmArchive = async () => {
    if (habitId) {
      try {
        await archiveHabitMutation.mutateAsync(habitId);
        setShowArchiveAlert(false);
        router.replace('/(tabs)');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error archiving habit:', error);
        setShowArchiveAlert(false);
      }
    }
  };

  const cancelArchive = () => {
    setShowArchiveAlert(false);
  };

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center p-4 rounded-lg"
        style={{ backgroundColor: Colors.card }}
        onPress={handleArchive}
      >
        <Icon source="archive" color={Colors.primary} size={24} />
        <Text className="ml-3 text-lg" style={{ color: Colors.text }}>
          Archive habit
        </Text>
      </TouchableOpacity>

      {showArchiveAlert && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
          <View
            className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full"
            style={{ backgroundColor: Colors.surface }}
          >
            <Text
              className="text-xl font-bold mb-3 text-center"
              style={{ color: Colors.text }}
            >
              Archive Habit
            </Text>
            <Text
              className="text-base mb-6 text-center"
              style={{ color: Colors.textSecondary }}
            >
              Archive this habit? You can restore it by filtering on Archived in the habit list.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.textTertiary }}
                onPress={cancelArchive}
              >
                <Text className="text-white font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.primary }}
                onPress={confirmArchive}
              >
                <Text className="text-white font-semibold text-base">
                  Archive
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
}
