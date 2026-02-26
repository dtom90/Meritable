import { Text, Pressable } from 'react-native';
import { Colors } from '@/lib/Colors';
import type { Exercise } from '@/db/habitDatabase';

type ExerciseListItemProps = {
  exercise: Exercise;
  onPress: () => void;
};

export function ExerciseListItem({ exercise, onPress }: ExerciseListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="p-4 rounded"
      style={{ backgroundColor: Colors.card }}
    >
      <Text style={{ color: Colors.text, fontSize: 17 }}>{exercise.name}</Text>
    </Pressable>
  );
}
