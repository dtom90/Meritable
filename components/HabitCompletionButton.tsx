
import { useCreateHabitCompletion, useDeleteHabitCompletion } from '@/db/useHabitDb';
import { View, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { Habit, HabitCompletion } from '@/db/types';


interface HabitCompletionButtonProps {
  habit: Habit;
  selectedDate: string;
  habitCompletionsMap: Record<number, HabitCompletion>;
}

export default function HabitCompletionButton({ habit, selectedDate, habitCompletionsMap }: HabitCompletionButtonProps) {
  const addCompletionMutation = useCreateHabitCompletion();
  const deleteCompletionMutation = useDeleteHabitCompletion();

  return (
    <View
      className="flex-1 flex-row items-center py-2 px-4 m-4 rounded-lg min-h-[68px]"
      style={{ backgroundColor: habitCompletionsMap[habit.id] ? Colors.success : Colors.surface }}
    >
      <Text className="text-lg flex-1 text-center" style={{ color: Colors.text }}>{habit.name}</Text>
      <View className="ml-auto mr-0 my-auto p-0">
        {!habitCompletionsMap[habit.id] ? (
          <IconButton
            icon="check"
            iconColor={Colors.success}
            size={24}
            onPress={() => addCompletionMutation.mutate({ habitId: habit.id, completionDate: selectedDate })}
            disabled={addCompletionMutation.isPending}
          />
        ) : (
          <IconButton
            icon="restore"
            iconColor={Colors.text}
            size={24}
            onPress={() => deleteCompletionMutation.mutate({ id: habitCompletionsMap[habit.id].id, completionDate: selectedDate })}
            disabled={deleteCompletionMutation.isPending}
          />
        )}
      </View>
    </View>
  )
}
