import { useState } from 'react';
import { View, Pressable, Text, Platform } from 'react-native';
import { Colors } from '@/lib/Colors';
import { ExerciseListStandard } from './ExerciseListStandard';
import { ExerciseReorderListWeb } from './ExerciseReorderListWeb';
import { ExerciseReorderListMobile } from './ExerciseReorderListMobile';
import { AddExerciseButton } from './AddExerciseButton';
import { useListExercises } from '@/db/useWorkoutDb';
import { NarrowView } from '@/components/common/NarrowView';

export function ExerciseList() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: exercises = [], refetch, isFetching } = useListExercises();

  return (
    <NarrowView
      disableScroll={isEditing}
      refreshing={isFetching}
      onRefresh={() => { void refetch(); }}
    >
      {exercises.length > 0 && (
        <View className="flex-row justify-between items-center">
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: Colors.primary }}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        </View>
      )}
      {isEditing ? (
        <View>
          {Platform.OS === 'web' ? (
            <ExerciseReorderListWeb />
          ) : (
            <ExerciseReorderListMobile />
          )}
          <AddExerciseButton />
        </View>
      ) : exercises.length === 0 ? (
        <AddExerciseButton />
      ) : (
        <ExerciseListStandard />
      )}
    </NarrowView>
  );
}
