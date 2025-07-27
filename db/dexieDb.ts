import Dexie, { Table } from 'dexie';
import { Habit, HabitCompletion } from './types'

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

export const dexieDb = new HabitDatabase();
