
export interface Habit {
  id?: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id?: number;
  habitId: number;
  completionDate: string;
  created_at?: string;
  updated_at?: string;
}
