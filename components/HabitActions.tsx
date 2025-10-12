import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { useDeleteHabit } from '@/db/useHabitDb';


export default function HabitActions({ habitId }: { habitId: number }) {
  const router = useRouter();
  const deleteHabitMutation = useDeleteHabit();

  const handleDelete = async () => {
    if(confirm('Are you sure that you want to delete this habit?')) {
      if (habitId) {
        try {
          await deleteHabitMutation.mutateAsync(habitId)
          router.replace('/(tabs)')
        } catch (e) {
          alert('There was a problem deleting this habit')
          console.error(e)
        }
      }
    }
  }

  return (
    <View className="p-6 rounded-lg" style={{ backgroundColor: Colors.surface }}>
      
      <View className="space-y-3">
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
  )
}
