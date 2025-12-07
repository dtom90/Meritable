import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCompletion, HabitCompletionInput, HabitDatabaseInterface, HabitInput } from './habitDatabase';

const HABITS_KEY = 'habits';
const HABIT_COMPLETIONS_KEY = 'habitCompletions';

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
}

export { AsyncStorageDb };

