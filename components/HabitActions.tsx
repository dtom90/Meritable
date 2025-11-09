import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { useDeleteHabit, useUpdateHabit, useListHabits } from '@/db/useHabitDb';


export default function HabitActions({ habitId }: { habitId: number }) {
  const router = useRouter();
  const deleteHabitMutation = useDeleteHabit();
  const updateHabitMutation = useUpdateHabit();
  const { data: habits = [] } = useListHabits();
  const habit = habits.find(h => h.id === habitId);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [countTarget, setCountTarget] = useState<string>('');

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (habitId) {
      try {
        await deleteHabitMutation.mutateAsync(habitId)
        setShowDeleteAlert(false);
        router.replace('/(tabs)')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting habit:', error);
        setShowDeleteAlert(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteAlert(false);
  };

  // Initialize countTarget from habit data
  useEffect(() => {
    if (habit?.countTarget !== undefined && habit.countTarget !== null) {
      setCountTarget(habit.countTarget.toString());
    } else {
      setCountTarget('');
    }
  }, [habit?.countTarget]);

  const handleCountTargetChange = (value: string) => {
    // Only allow numbers or empty string
    if (value === '' || /^\d+$/.test(value)) {
      setCountTarget(value);
    }
  };

  const handleCountTargetBlur = async () => {
    if (!habit) return;
    
    const numericValue = countTarget === '' ? null : parseInt(countTarget, 10);
    
    // Only update if the value has changed
    if (numericValue !== habit.countTarget) {
      try {
        await updateHabitMutation.mutateAsync({
          id: habitId,
          updates: { countTarget: numericValue ?? undefined }
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error updating count target:', error);
        // Revert to original value on error
        setCountTarget(habit.countTarget?.toString() ?? '');
      }
    }
  };

  if (!habit) {
    return null;
  }

  return (
    <>
      <View className="p-6 rounded-lg" style={{ backgroundColor: Colors.surface }}>
        
        <View className="space-y-3">
          {/* Count Target Input */}
          <View className="p-4 rounded-lg" style={{ backgroundColor: Colors.card }}>
            <Text className="text-base mb-2" style={{ color: Colors.text }}>
              Count Target (optional)
            </Text>
            <TextInput
              className="p-3 rounded"
              style={{ 
                backgroundColor: Colors.background, 
                color: Colors.text,
                borderWidth: 1,
                borderColor: Colors.textSecondary + '40'
              }}
              placeholder="Enter target count..."
              value={countTarget}
              onChangeText={handleCountTargetChange}
              onBlur={handleCountTargetBlur}
              keyboardType="numeric"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <TouchableOpacity 
            className="flex-row items-center p-4 rounded-lg"
            style={{ backgroundColor: Colors.card }}
            onPress={handleDelete}
          >
            <Icon source="delete" color={Colors.primary} size={24} />
            <Text className="ml-3 text-lg" style={{ color: Colors.text }}>
              Delete Habit
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      {showDeleteAlert && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
          <View className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full" style={{ backgroundColor: Colors.surface }}>
            <Text className="text-xl font-bold mb-3 text-center" style={{ color: Colors.text }}>
              Delete Habit
            </Text>
            <Text className="text-base mb-6 text-center" style={{ color: Colors.textSecondary }}>
              Are you sure that you want to delete this habit?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.textTertiary }}
                onPress={cancelDelete}
              >
                <Text className="text-white font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-lg items-center justify-center"
                style={{ backgroundColor: Colors.error }}
                onPress={confirmDelete}
              >
                <Text className="text-white font-semibold text-base">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  )
}
