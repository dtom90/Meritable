import type {
  Habit,
  HabitCompletion,
  HabitCompletionInput,
  HabitInput,
  Exercise,
  ExerciseInput,
  Set,
  SetInput,
  Task,
  TaskInput,
  Tag,
} from './types';

export abstract class HabitDatabaseInterface {
  // Habit operations
  abstract createHabit(habit: { name: string }): Promise<Habit>
  abstract getHabits(): Promise<Habit[]>
  abstract updateHabit(id: number, updates: Partial<HabitInput>): Promise<Habit>
  abstract reorderHabits(habits: Habit[]): Promise<Habit[]>
  abstract deleteHabit(id: number): Promise<void>

  // HabitCompletion operations
  abstract createHabitCompletion(habitCompletion: HabitCompletionInput): Promise<HabitCompletion>
  abstract updateHabitCompletion(id: number, updates: Partial<HabitCompletionInput>): Promise<HabitCompletion>
  abstract getHabitCompletionsByDate(completionDate?: string): Promise<HabitCompletion[]>
  abstract getHabitCompletionsById(habitId: number): Promise<HabitCompletion[]>
  abstract deleteHabitCompletion(id: number): Promise<void>

  // Exercise operations
  abstract createExercise(exercise: { name: string }): Promise<Exercise>
  abstract getExercises(): Promise<Exercise[]>
  abstract updateExercise(id: number, updates: Partial<ExerciseInput>): Promise<Exercise>
  abstract reorderExercises(exercises: Exercise[]): Promise<Exercise[]>
  abstract deleteExercise(id: number): Promise<void>

  // Set operations
  abstract createSet(set: SetInput): Promise<Set>
  abstract getSetsByExerciseId(exerciseId: number): Promise<Set[]>
  abstract updateSet(id: number, updates: Partial<SetInput>): Promise<Set>
  abstract deleteSet(id: number): Promise<void>

  // Task operations (Quick Wins)
  abstract createTask(task: TaskInput): Promise<Task>
  abstract getTasks(): Promise<Task[]>
  abstract getTask(id: number): Promise<Task | null>
  abstract updateTask(id: number, updates: Partial<TaskInput>): Promise<Task>
  abstract deleteTask(id: number): Promise<void>

  // Tag operations (Quick Wins)
  abstract getTags(): Promise<Tag[]>
  abstract createTag(name: string): Promise<Tag>
  abstract getTaskTagIds(taskId: number): Promise<number[]>
  abstract setTaskTags(taskId: number, tagIds: number[]): Promise<void>
  abstract getTaskTagIdsMap(): Promise<Record<number, number[]>>
  abstract deleteTag(id: number): Promise<void>
}
