import { useCallback, useState } from 'react';
import { View, Pressable, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/lib/Colors';
import { ExerciseListStandard } from './ExerciseListStandard';
import { AddExerciseButton } from './AddExerciseButton';
import {
  useListExercises,
  useListArchivedExercises,
  useReorderExercises,
  useArchiveExercise,
} from '@/db/useWorkoutDb';
import { NarrowView } from '@/components/common/NarrowView';
import { ReorderEditLayout } from '@/components/common/ReorderEditLayout';
import PillButton from '@/components/common/PillButton';
import Spinner from '@/components/common/Spinner';
import type { Exercise } from '@/db/types';

type ExerciseFilter = 'active' | 'archived';

export function ExerciseList() {
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState<ExerciseFilter>('active');
  const { data: exercises = [], isLoading: isLoadingExercises, refetch, isFetching } = useListExercises();
  const { data: archivedExercises = [], isLoading: isLoadingArchived, refetch: refetchArchived } = useListArchivedExercises();
  const { mutate: reorderExercises } = useReorderExercises();
  const archiveExerciseMutation = useArchiveExercise();
  const [archivingExerciseId, setArchivingExerciseId] = useState<number | null>(null);
  const router = useRouter();

  const handleArchiveExercise = useCallback(
    (exerciseId: number) => {
      Alert.alert(
        'Archive Exercise',
        'Archive this exercise? You can restore it by filtering on Archived in the exercise list.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            onPress: () => {
              setArchivingExerciseId(exerciseId);
              archiveExerciseMutation.mutate(exerciseId, {
                onSettled: () => setArchivingExerciseId(null),
              });
            },
          },
        ]
      );
    },
    [archiveExerciseMutation]
  );

  const getExerciseArchiveButton = useCallback(
    (exercise: Exercise) => {
      if (exercise.id == null) return undefined;
      return {
        onPress: () => handleArchiveExercise(exercise.id!),
        icon: 'archive',
        iconColor: Colors.primary,
        loading: archivingExerciseId === exercise.id && archiveExerciseMutation.isPending,
        disabled: archiveExerciseMutation.isPending && archivingExerciseId !== exercise.id,
      };
    },
    [archivingExerciseId, archiveExerciseMutation.isPending, handleArchiveExercise]
  );

  const showActive = filter === 'active';
  const isLoading = showActive ? isLoadingExercises : isLoadingArchived;

  const handleRefresh = () => {
    void refetch();
    void refetchArchived();
  };

  const listBody = (
    <>
      <View className="flex-row justify-between items-center mb-2">
        {showActive && exercises && exercises.length > 0 ? (
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={{ color: Colors.primary }}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable onPress={() => setFilter(showActive ? 'archived' : 'active')}>
          <Text style={{ color: Colors.primary }}>
            {showActive ? 'Archived' : 'Active'}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Spinner />
      ) : showActive ? (
        isEditing ? (
          <ReorderEditLayout
            footer={<AddExerciseButton />}
            data={exercises}
            getItemId={(ex) => ex.id?.toString() ?? ''}
            getItemLabel={(ex) => ex.name}
            getItemSecondaryButton={getExerciseArchiveButton}
            onReorder={(reordered) =>
              reorderExercises(reordered.map((ex, i) => ({ ...ex, order: i })))}
            loading={isLoadingExercises}
          />
        ) : (
          <>
            {exercises.length === 0 ? null : <ExerciseListStandard />}
            <AddExerciseButton />
          </>
        )
      ) : (
        <ArchivedExercisesList
          exercises={archivedExercises}
          onPressExercise={(id) => router.push(`/workouts/${id}`)}
        />
      )}
    </>
  );

  return (
    <NarrowView
      disableScroll={isEditing}
      refreshing={isFetching}
      onRefresh={handleRefresh}
    >
      {isEditing ? (
        <View className="flex-1 min-h-0">{listBody}</View>
      ) : (
        listBody
      )}
    </NarrowView>
  );
}

function ArchivedExercisesList({
  exercises,
  onPressExercise,
}: {
  exercises: Exercise[];
  onPressExercise: (id: number) => void;
}) {
  if (exercises.length === 0) {
    return (
      <View className="py-8">
        <Text className="text-center" style={{ color: Colors.textSecondary }}>
          No archived exercises. Archive an exercise from edit mode.
        </Text>
      </View>
    );
  }
  return (
    <View>
      {exercises.map((exercise) => (
        <PillButton
          key={exercise.id}
          text={exercise.name}
          onMainPress={() => exercise.id != null && onPressExercise(exercise.id)}
        />
      ))}
    </View>
  );
}
