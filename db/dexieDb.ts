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
  async createHabit(habit: { name: string }): Promise<Habit> {
    const now = new Date().toISOString();
    
    // Get the current highest order value to assign the next order
    const existingHabits = await this.habits.toArray();
    const nextOrder = existingHabits.length > 0 
      ? Math.max(...existingHabits.map(h => h.order)) + 1 
      : 0;
    
    const habitToAdd = {
      ...habit,
      order: nextOrder,
      created_at: now,
      updated_at: now
    };
    
    const id = await this.habits.add(habitToAdd as any);
    
    const habitWithTimestamps: Habit = {
      ...habitToAdd,
      id,
    };
    return habitWithTimestamps;
  }

  async getHabits(): Promise<Habit[]> {
    const habits = await this.habits.toArray();
    // Sort by order field to maintain custom ordering
    // Fallback to id for habits without order field
    return habits.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // If order is missing, sort by id as fallback
      return (a.id || 0) - (b.id || 0);
    });
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

  async reorderHabits(habits: Habit[]): Promise<Habit[]> {
    const now = new Date().toISOString();
    
    // Update each habit with the new order and timestamp
    const updatedHabits = habits.map(habit => ({
      ...habit,
      updated_at: now
    }));
    
    await this.habits.bulkPut(updatedHabits);
    return updatedHabits;
  }

  async deleteHabit(id: number): Promise<void> {
    // First delete related completions
    await this.habitCompletions.where('habitId').equals(id).delete();
    // Then delete the habit
    await this.habits.delete(id);
  }

  async createHabitCompletion(completion: Omit<HabitCompletion, 'id'>): Promise<HabitCompletion> {
    const now = new Date().toISOString();
    const completionToAdd = {
      ...completion,
      created_at: now,
      updated_at: now
    };
    
    const id = await this.habitCompletions.add(completionToAdd as any);
    
    const completionWithTimestamps: HabitCompletion = {
      ...completionToAdd,
      id,
    };
    return completionWithTimestamps;
  }

  async getHabitCompletionsByDate(completionDate?: string): Promise<HabitCompletion[]> {
    if (completionDate) {
      return await this.habitCompletions.where('completionDate').equals(completionDate).toArray();
    }
    return await this.habitCompletions.toArray();
  }

  async getHabitCompletionsById(habitId: number): Promise<HabitCompletion[]> {
    return await this.habitCompletions.where('habitId').equals(habitId).toArray();
  }

  async deleteHabitCompletion(id: number): Promise<void> {
    await this.habitCompletions.delete(id);
  }
}

export { DexieDb }
