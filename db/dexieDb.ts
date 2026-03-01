import Dexie, { Table } from 'dexie';
import { Habit, HabitCompletion, HabitCompletionInput, HabitInput, Exercise, ExerciseInput, Set, SetInput } from './types';
import { HabitDatabaseInterface } from './habitDatabase';

class DexieDb extends Dexie implements HabitDatabaseInterface {
  habits!: Table<Habit>;
  habitCompletions!: Table<HabitCompletion>;
  exercises!: Table<Exercise>;
  sets!: Table<Set>;

  constructor() {
    super('HabitDatabase');
    this.version(1).stores({
      habits: '++id',
      habitCompletions: '++id, habitId, completionDate'
    });
    this.version(2).stores({
      habits: '++id',
      habitCompletions: '++id, habitId, completionDate',
      exercises: '++id',
      sets: '++id, exerciseId, completionDate'
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

  async updateHabitCompletion(id: number, updates: Partial<HabitCompletionInput>): Promise<HabitCompletion> {
    const now = new Date().toISOString();
    const completion = await this.habitCompletions.get(id);
    if (!completion) {
      throw new Error(`HabitCompletion with id ${id} not found`);
    }
    
    const updatedCompletion = {
      ...completion,
      ...updates,
      updated_at: now
    };
    
    await this.habitCompletions.update(id, updatedCompletion);
    return updatedCompletion;
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

  // Exercise operations
  async createExercise(exercise: { name: string }): Promise<Exercise> {
    const now = new Date().toISOString();
    const existing = await this.exercises.toArray();
    const nextOrder = existing.length > 0 ? Math.max(...existing.map(e => e.order)) + 1 : 0;
    const toAdd = { ...exercise, order: nextOrder, created_at: now, updated_at: now };
    const id = await this.exercises.add(toAdd as any);
    return { ...toAdd, id };
  }

  async getExercises(): Promise<Exercise[]> {
    const list = await this.exercises.toArray();
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  }

  async updateExercise(id: number, updates: Partial<ExerciseInput>): Promise<Exercise> {
    const now = new Date().toISOString();
    const exercise = await this.exercises.get(id);
    if (!exercise) throw new Error(`Exercise with id ${id} not found`);
    const updated = { ...exercise, ...updates, updated_at: now };
    await this.exercises.update(id, updated);
    return updated;
  }

  async deleteExercise(id: number): Promise<void> {
    await this.sets.where('exerciseId').equals(id).delete();
    await this.exercises.delete(id);
  }

  // Set operations
  async createSet(set: SetInput): Promise<Set> {
    const now = new Date().toISOString();
    const toAdd = { ...set, created_at: now, updated_at: now };
    const id = await this.sets.add(toAdd as any);
    return { ...toAdd, id };
  }

  async getSetsByExerciseId(exerciseId: number): Promise<Set[]> {
    const list = await this.sets.where('exerciseId').equals(exerciseId).toArray();
    return list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }

  async updateSet(id: number, updates: Partial<SetInput>): Promise<Set> {
    const now = new Date().toISOString();
    const set = await this.sets.get(id);
    if (!set) throw new Error(`Set with id ${id} not found`);
    const updated = { ...set, ...updates, updated_at: now };
    await this.sets.update(id, updated);
    return updated;
  }

  async deleteSet(id: number): Promise<void> {
    await this.sets.delete(id);
  }
}

export { DexieDb }
