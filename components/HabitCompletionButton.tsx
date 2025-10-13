
import { useCreateHabitCompletion, useDeleteHabitCompletion } from '@/db/useHabitDb';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';
import { Colors } from '@/lib/Colors';
import { Habit, HabitCompletion } from '@/db/types';
import { useRouter } from 'expo-router';


interface HabitCompletionButtonProps {
  habit: Habit;
  selectedDate: string;
  habitCompletionsMap: Record<number, HabitCompletion>;
}

export default function HabitCompletionButton({ habit, selectedDate, habitCompletionsMap }: HabitCompletionButtonProps) {
  const addCompletionMutation = useCreateHabitCompletion();
  const deleteCompletionMutation = useDeleteHabitCompletion();
  const router = useRouter();

  const navigateToHabit = () => {
    if (habit.id) {
      router.push(`/habits/${habit.id}`);
    }
  };

  const backgroundColor = habitCompletionsMap[habit.id] ? Colors.success : Colors.surface

  return (
    <View
      className="flex-1 flex-row items-center justify-between py-2 px-4 my-4 rounded-lg min-h-[68px]"
      style={{ backgroundColor }}
    >
      <View className="w-0 sm:w-[52px] h-[52px] transition-all duration-300" />
      
      <View>
        <TouchableOpacity 
          onPress={navigateToHabit}
          style={{ backgroundColor: habitCompletionsMap[habit.id] ? Colors.successSecondary : Colors.card }}
          className='pl-4 pr-2 py-2 rounded-lg flex flex-row items-center'
        >
          <Text className="text-lg text-center mr-1" style={{ color: Colors.text }}>{habit.name}</Text>
          <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
      
      <View>
        {!habitCompletionsMap[habit.id] ? (
          <IconButton
            icon="check"
            iconColor={Colors.success}
            containerColor={Colors.card}
            size={24}
            onPress={() => addCompletionMutation.mutate({ habitId: habit.id, completionDate: selectedDate })}
            disabled={addCompletionMutation.isPending}
          />
        ) : (
          <IconButton
            icon="restore"
            iconColor={Colors.text}
            containerColor={Colors.successSecondary}
            size={24}
            onPress={() => deleteCompletionMutation.mutate({ id: habitCompletionsMap[habit.id].id, completionDate: selectedDate })}
            disabled={deleteCompletionMutation.isPending}
          />
        )}
      </View>
    </View>
  )
}
