import { createClient } from '@supabase/supabase-js';
import { Habit, HabitCompletion } from './types'
import { offlineSyncService } from './offlineSync';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const createHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Habit> => {
  // Use offline sync service for all operations
  return await offlineSyncService.createHabit(habit);
};

export const listHabits = async (): Promise<Habit[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('habits')
      .select('*')
      .eq('is_deleted', false) // Only show non-deleted habits
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch habits:', error);
    // Return empty array if offline or error occurs
    return [];
  }
};

export const updateHabit = async (id: number, updates: Partial<Habit>): Promise<Habit> => {
  return await offlineSyncService.updateHabit(id, updates);
};

export const deleteHabit = async (id: number): Promise<void> => {
  await offlineSyncService.deleteHabit(id);
};

// New functions for offline sync
export const getSyncStatus = () => {
  return offlineSyncService.getSyncStatus();
};

export const forceSync = async () => {
  await offlineSyncService.forceSync();
};

// Function to get habits that need syncing
export const getHabitsNeedingSync = async (): Promise<Habit[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('habits')
      .select('*')
      .eq('should_sync', true);
    
    if (error) throw new Error(error.message);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch habits needing sync:', error);
    return [];
  }
};
