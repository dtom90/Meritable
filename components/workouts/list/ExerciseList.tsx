import { Platform } from 'react-native';
import { ExerciseListWeb } from './ExerciseListWeb';
import { ExerciseListMobile } from './ExerciseListMobile';

export function ExerciseList() {
  return Platform.OS === 'web' ? (
    <ExerciseListWeb />
  ) : (
    <ExerciseListMobile />
  );
}
