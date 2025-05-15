import Dexie, { Table } from 'dexie';

export interface Habit {
  id?: number;
  name: string;
}

export interface HabitCompletion {
  id?: number;
  habitId: number;
  date: string;
}

class HabitDatabase extends Dexie {
  habits!: Table<Habit>;
  habitCompletions!: Table<HabitCompletion>;

  constructor() {
    super('HabitDatabase');
    this.version(1).stores({
      habits: '++id',
      habitCompletions: '++id, habitId, date'
    });
  }
}

export const db = new HabitDatabase(); 