import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Colors } from '@/lib/Colors';
import { ExerciseListStandard } from './ExerciseListStandard';
import { AddExerciseButton } from './AddExerciseButton';
import { useListExercises, useReorderExercises } from '@/db/useWorkoutDb';
import { NarrowView } from '@/components/common/NarrowView';
import { ReorderEditLayout } from '@/components/common/ReorderEditLayout';
import Spinner from '@/components/common/Spinner';

export function ExerciseList() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: exercises = [], isLoading: isLoadingExercises, refetch, isFetching } = useListExercises();
  const { mutate: reorderExercises } = useReorderExercises();

  return (
    <NarrowView
      disableScroll={isEditing}
      refreshing={isFetching}
      onRefresh={() => { void refetch(); }}
    >
      {exercises && exercises.length > 0 && (
        <View className="flex-row justify-between items-center">
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: Colors.primary }}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        </View>
      )}

      {isLoadingExercises ? (
        <Spinner />
      ) : isEditing ? (
        <ReorderEditLayout
          footer={<AddExerciseButton />}
          data={exercises}
          getItemId={(ex) => ex.id?.toString() ?? ''}
          getItemLabel={(ex) => ex.name}
          onReorder={(reordered) =>
            reorderExercises(reordered.map((ex, i) => ({ ...ex, order: i })))}
          loading={isLoadingExercises}
        />
      ) : (
        <>
          {exercises.length === 0 ? null : <ExerciseListStandard />}
          <AddExerciseButton />
        </>
      )}
    </NarrowView>
  );
}
