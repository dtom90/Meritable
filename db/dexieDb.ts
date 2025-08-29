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

  async updateHabit(id: number, updates: Partial<HabitInput>): Promise<Habit> {
    const now = new Date().toISOString();
    const habit = await this.habits.get(id);
    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    
    const updatedHabit = {
      ...habit,
      ...updates,
      updated_at: now
    };
    
    await this.habits.update(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<void> {
    // First delete related completions
    await this.habitCompletions.where('habitId').equals(id).delete();
    // Then delete the habit
    await this.habits.delete(id);
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

  async getHabitCompletions(completionDate?: string): Promise<HabitCompletion[]> {
    if (completionDate) {
      return await this.habitCompletions.where('completionDate').equals(completionDate).toArray();
    }
    return await this.habitCompletions.toArray();
  }

  async deleteHabitCompletion(id: number): Promise<void> {
    await this.habitCompletions.delete(id);
  }
}

export { DexieDb }
