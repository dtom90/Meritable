
export interface Habit {
  id?: number;
  name: string;
}

export interface HabitCompletion {
  id?: number;
  habitId: number;
  date: string;
}
