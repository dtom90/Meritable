import Dexie, { Table } from 'dexie';
import { Habit, HabitCompletion } from './types'

class HabitDatabase extends Dexie {
  habits!: Table<Habit>;
  habitCompletions!: Table<HabitCompletion>;

  constructor() {
    super('HabitDatabase');
    this.version(1).stores({
      habits: '++id',
      habitCompletions: '++id, habitId, completionDate'
    });
  }

  // Wrapper methods for automatic timestamp handling
  async addHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const now = new Date().toISOString();
    const habitWithTimestamps: Habit = {
      ...habit,
      created_at: now,
      updated_at: now
    };
    return await this.habits.add(habitWithTimestamps);
  }

  async updateHabit(id: number, updates: Partial<Habit>): Promise<void> {
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    await this.habits.update(id, updatesWithTimestamp);
  }

  async addHabitCompletion(completion: Omit<HabitCompletion, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const now = new Date().toISOString();
    const completionWithTimestamps: HabitCompletion = {
      ...completion,
      created_at: now,
      updated_at: now
    };
    return await this.habitCompletions.add(completionWithTimestamps);
  }

  async updateHabitCompletion(id: number, updates: Partial<HabitCompletion>): Promise<void> {
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    await this.habitCompletions.update(id, updatesWithTimestamp);
  }
}

export const dexieDb = new HabitDatabase();
