import { useState } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { ExerciseListStandard } from './ExerciseListStandard';
import { ExerciseReorderListWeb } from './ExerciseReorderListWeb';
import { ExerciseReorderListMobile } from './ExerciseReorderListMobile';
import { AddExerciseButton } from './AddExerciseButton';
import { useListExercises } from '@/db/useWorkoutDb';

export function ExerciseList() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: exercises = [] } = useListExercises();

  const list = isEditing ? (
    <View className="flex-1">
      {Platform.OS === 'web' ? (
        <ExerciseReorderListWeb />
      ) : (
        <ExerciseReorderListMobile />
      )}
      <AddExerciseButton />
    </View>
  ) : (
    <ExerciseListStandard />
  );

  return (
    <>
      {exercises.length > 1 && (
        <View className="flex-row justify-between items-center">
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: Colors.primary }}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        </View>
      )}
      {list}
    </>
  );
}
