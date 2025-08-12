import Dexie, { Table } from 'dexie';
import { Habit, HabitCompletion, HabitDatabaseInterface, HabitInput } from './types'

class DexieDb extends Dexie implements HabitDatabaseInterface {
  habits!: Table<Habit>;
  habitCompletions!: Table<HabitCompletion>;

  constructor() {
    super('HabitDatabase');
    this.version(1).stores({
      habits: '++id',
      habitCompletions: '++id, habitId, completionDate'
    });
  }

  // Implementation of HabitDatabaseInterface methods
  async createHabit(habit: HabitInput): Promise<Habit> {
    const now = new Date().toISOString();
    const habitWithTimestamps: Habit = {
      ...habit,
      id: await this.habits.add({
        ...habit,
        created_at: now,
        updated_at: now
      }),
      created_at: now,
      updated_at: now
    };
    return habitWithTimestamps;
  }

  async getHabits(): Promise<Habit[]> {
    return await this.habits.toArray();
  }

  async deleteHabit(id: number): Promise<void> {
    await this.habits.delete(id);
    // Also delete related completions
    await this.habitCompletions.where('habitId').equals(id).delete();
  }

  async createHabitCompletion(completion: Omit<HabitCompletion, 'id'>): Promise<HabitCompletion> {
    const now = new Date().toISOString();
    const completionWithTimestamps: HabitCompletion = {
      ...completion,
      id: await this.habitCompletions.add({
        ...completion,
        created_at: now,
        updated_at: now
      }),
      created_at: now,
      updated_at: now
    };
    return completionWithTimestamps;
  }

  async getHabitCompletions(habitId?: number): Promise<HabitCompletion[]> {
    if (habitId) {
      return await this.habitCompletions.where('habitId').equals(habitId).toArray();
    }
    return await this.habitCompletions.toArray();
  }

  async deleteHabitCompletion(id: number): Promise<void> {
    await this.habitCompletions.delete(id);
  }
}

export { DexieDb }
