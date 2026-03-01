import { Text, Pressable, View } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Exercise } from '@/db/types';
import { Icon } from 'react-native-paper';

type ExerciseListItemProps = {
  exercise: Exercise;
  onPress: () => void;
};

export function ExerciseListItem({ exercise, onPress }: ExerciseListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-4 my-4 rounded-lg min-h-[68px]"
      style={{ backgroundColor: Colors.surface }}
    >
      <View className="flex-1 flex-row items-center justify-center">
        <Text style={{ color: Colors.text, fontSize: 17 }}>{exercise.name}</Text>
        <Icon source="chevron-right" color={Colors.textSecondary} size={20} />
      </View>
    </Pressable>
  );
}
