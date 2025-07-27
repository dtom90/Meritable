
export interface Habit {
  id?: number;
  name: string;
  shouldSync: boolean;
}

export interface HabitCompletion {
  id?: number;
  habitId: number;
  completionDate: string;
  shouldSync: boolean;
}
