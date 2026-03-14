import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { useDeleteTask } from '@/db/useTasks';

export default function DeleteTaskButton({ taskId }: { taskId: number }) {
  const router = useRouter();
  const deleteTaskMutation = useDeleteTask();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (taskId) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
        setShowDeleteAlert(false);
        router.replace('/(tabs)/quick-wins');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting task:', error);
        setShowDeleteAlert(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteAlert(false);
  };

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center p-4 rounded-lg"
        style={{ backgroundColor: Colors.card }}
        onPress={handleDelete}
      >
        <Icon source="delete" color={Colors.primary} size={24} />
        <Text className="ml-3 text-lg" style={{ color: Colors.text }}>
          Delete Task
        </Text>
      </TouchableOpacity>

      {showDeleteAlert && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
          <View
            className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full"
            style={{ backgroundColor: Colors.surface }}
          >
            <Text
              className="text-xl font-bold mb-3 text-center"
              style={{ color: Colors.text }}
            >
              Delete Task
            </Text>
            <Text
              className="text-base mb-6 text-center"
              style={{ color: Colors.textSecondary }}
            >
              Are you sure that you want to delete this task?
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
  );
}
