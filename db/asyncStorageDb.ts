import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCompletion, HabitCompletionInput, HabitDatabaseInterface, HabitInput, Exercise, ExerciseInput, Set, SetInput } from './habitDatabase';

const HABITS_KEY = 'habits';
const HABIT_COMPLETIONS_KEY = 'habitCompletions';
const EXERCISES_KEY = 'exercises';
const SETS_KEY = 'sets';

class AsyncStorageDb implements HabitDatabaseInterface {
  // Helper methods for AsyncStorage operations
  private async loadHabits(): Promise<Habit[]> {
    const data = await AsyncStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async saveHabits(habits: Habit[]): Promise<void> {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  }

  private async loadHabitCompletions(): Promise<HabitCompletion[]> {
    const data = await AsyncStorage.getItem(HABIT_COMPLETIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async saveHabitCompletions(completions: HabitCompletion[]): Promise<void> {
    await AsyncStorage.setItem(HABIT_COMPLETIONS_KEY, JSON.stringify(completions));
  }

  private async loadExercises(): Promise<Exercise[]> {
    const data = await AsyncStorage.getItem(EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async saveExercises(exercises: Exercise[]): Promise<void> {
    await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  }

  private async loadSets(): Promise<Set[]> {
    const data = await AsyncStorage.getItem(SETS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private async saveSets(sets: Set[]): Promise<void> {
    await AsyncStorage.setItem(SETS_KEY, JSON.stringify(sets));
  }

  // Habit operations
  async createHabit(habit: { name: string }): Promise<Habit> {
    const now = new Date().toISOString();
    const habits = await this.loadHabits();
    
    // Get the current highest order value to assign the next order
    const nextOrder = habits.length > 0 
      ? Math.max(...habits.map(h => h.order)) + 1 
      : 0;
    
    // Generate next ID
    const nextId = habits.length > 0 
      ? Math.max(...habits.map(h => h.id)) + 1 
      : 1;
    
    const habitToAdd: Habit = {
      ...habit,
      id: nextId,
      order: nextOrder,
      created_at: now,
      updated_at: now
    };
    
    habits.push(habitToAdd);
    await this.saveHabits(habits);
    
    return habitToAdd;
  }

  async getHabits(): Promise<Habit[]> {
    const habits = await this.loadHabits();
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
    const habits = await this.loadHabits();
    const habitIndex = habits.findIndex(h => h.id === id);
    
    if (habitIndex === -1) {
      throw new Error(`Habit with id ${id} not found`);
    }
    
    const updatedHabit: Habit = {
      ...habits[habitIndex],
      ...updates,
      updated_at: now
    };
    
    habits[habitIndex] = updatedHabit;
    await this.saveHabits(habits);
    
    return updatedHabit;
  }

  async reorderHabits(habits: Habit[]): Promise<Habit[]> {
    const now = new Date().toISOString();
    
    // Update each habit with the new order and timestamp
    const updatedHabits = habits.map(habit => ({
      ...habit,
      updated_at: now
    }));
    
    await this.saveHabits(updatedHabits);
    return updatedHabits;
  }

  async deleteHabit(id: number): Promise<void> {
    // First delete related completions
    const completions = await this.loadHabitCompletions();
    const filteredCompletions = completions.filter(c => c.habitId !== id);
    await this.saveHabitCompletions(filteredCompletions);
    
    // Then delete the habit
    const habits = await this.loadHabits();
    const filteredHabits = habits.filter(h => h.id !== id);
    await this.saveHabits(filteredHabits);
  }

  // HabitCompletion operations
  async createHabitCompletion(completion: HabitCompletionInput): Promise<HabitCompletion> {
    const now = new Date().toISOString();
    const completions = await this.loadHabitCompletions();
    
    // Generate next ID
    const nextId = completions.length > 0 
      ? Math.max(...completions.map(c => c.id)) + 1 
      : 1;
    
    const completionToAdd: HabitCompletion = {
      ...completion,
      id: nextId,
      created_at: now,
      updated_at: now
    };
    
    completions.push(completionToAdd);
    await this.saveHabitCompletions(completions);
    
    return completionToAdd;
  }

  async updateHabitCompletion(id: number, updates: Partial<HabitCompletionInput>): Promise<HabitCompletion> {
    const now = new Date().toISOString();
    const completions = await this.loadHabitCompletions();
    const completionIndex = completions.findIndex(c => c.id === id);
    
    if (completionIndex === -1) {
      throw new Error(`HabitCompletion with id ${id} not found`);
    }
    
    const updatedCompletion: HabitCompletion = {
      ...completions[completionIndex],
      ...updates,
      updated_at: now
    };
    
    completions[completionIndex] = updatedCompletion;
    await this.saveHabitCompletions(completions);
    
    return updatedCompletion;
  }

  async getHabitCompletionsByDate(completionDate?: string): Promise<HabitCompletion[]> {
    const completions = await this.loadHabitCompletions();
    if (completionDate) {
      return completions.filter(c => c.completionDate === completionDate);
    }
    return completions;
  }

  async getHabitCompletionsById(habitId: number): Promise<HabitCompletion[]> {
    const completions = await this.loadHabitCompletions();
    return completions.filter(c => c.habitId === habitId);
  }

  async deleteHabitCompletion(id: number): Promise<void> {
    const completions = await this.loadHabitCompletions();
    const filteredCompletions = completions.filter(c => c.id !== id);
    await this.saveHabitCompletions(filteredCompletions);
  }

  // Exercise operations
  async createExercise(exercise: { name: string }): Promise<Exercise> {
    const now = new Date().toISOString();
    const exercises = await this.loadExercises();
    const nextOrder = exercises.length > 0 ? Math.max(...exercises.map(e => e.order)) + 1 : 0;
    const nextId = exercises.length > 0 ? Math.max(...exercises.map(e => e.id)) + 1 : 1;
    const toAdd: Exercise = { ...exercise, id: nextId, order: nextOrder, created_at: now, updated_at: now };
    exercises.push(toAdd);
    await this.saveExercises(exercises);
    return toAdd;
  }

  async getExercises(): Promise<Exercise[]> {
    const exercises = await this.loadExercises();
    return exercises.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  }

  async updateExercise(id: number, updates: Partial<ExerciseInput>): Promise<Exercise> {
    const now = new Date().toISOString();
    const exercises = await this.loadExercises();
    const idx = exercises.findIndex(e => e.id === id);
    if (idx === -1) throw new Error(`Exercise with id ${id} not found`);
    const updated: Exercise = { ...exercises[idx], ...updates, updated_at: now };
    exercises[idx] = updated;
    await this.saveExercises(exercises);
    return updated;
  }

  async deleteExercise(id: number): Promise<void> {
    const sets = await this.loadSets();
    await this.saveSets(sets.filter(s => s.exerciseId !== id));
    const exercises = await this.loadExercises();
    await this.saveExercises(exercises.filter(e => e.id !== id));
  }

  // Set operations
  async createSet(set: SetInput): Promise<Set> {
    const now = new Date().toISOString();
    const sets = await this.loadSets();
    const nextId = sets.length > 0 ? Math.max(...sets.map(s => s.id)) + 1 : 1;
    const toAdd: Set = { ...set, id: nextId, created_at: now, updated_at: now };
    sets.push(toAdd);
    await this.saveSets(sets);
    return toAdd;
  }

  async getSetsByExerciseId(exerciseId: number): Promise<Set[]> {
    const sets = await this.loadSets();
    return sets.filter(s => s.exerciseId === exerciseId).sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }

  async updateSet(id: number, updates: Partial<SetInput>): Promise<Set> {
    const now = new Date().toISOString();
    const sets = await this.loadSets();
    const idx = sets.findIndex(s => s.id === id);
    if (idx === -1) throw new Error(`Set with id ${id} not found`);
    const updated: Set = { ...sets[idx], ...updates, updated_at: now };
    sets[idx] = updated;
    await this.saveSets(sets);
    return updated;
  }

  async deleteSet(id: number): Promise<void> {
    const sets = await this.loadSets();
    await this.saveSets(sets.filter(s => s.id !== id));
  }
}

export { AsyncStorageDb };

