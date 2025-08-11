import { supabaseClient } from './supabaseClient';
import { Habit, HabitCompletion, SyncStatus, SyncConflict } from './types';

export class OfflineSyncService {
  private isOnline: boolean = navigator.onLine;
  private syncQueue: Array<{ type: 'create' | 'update' | 'delete'; table: string; data: any }> = [];
  private lastSyncTime: string = new Date().toISOString();

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Create a new habit with offline sync support
  async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Habit> {
    const localId = this.generateLocalId();
    const timestamp = new Date().toISOString();
    
    const habitData: Habit = {
      ...habit,
      local_id: localId,
      created_at: timestamp,
      updated_at: timestamp,
      version: 1,
      shouldSync: true
    };

    if (this.isOnline) {
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !userData?.user?.id) throw new Error('User not authenticated');
        
        const { data, error } = await supabaseClient
          .from('habits')
          .insert([{ ...habitData, user_id: userData.user.id }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local data with server response
        return { ...data, local_id: localId };
      } catch (error) {
        // If online creation fails, queue for sync
        this.addToSyncQueue('create', 'habits', habitData);
        return habitData;
      }
    } else {
      // Offline: store locally and queue for sync
      this.addToSyncQueue('create', 'habits', habitData);
      return habitData;
    }
  }

  // Update a habit with conflict resolution
  async updateHabit(id: number, updates: Partial<Habit>): Promise<Habit> {
    const timestamp = new Date().toISOString();
    
    if (this.isOnline) {
      try {
        // Get current server version
        const { data: currentData, error: fetchError } = await supabaseClient
          .from('habits')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Check for conflicts
        if (currentData.version !== updates.version) {
          // Conflict detected - resolve it
          const conflict = await this.resolveConflict(currentData, updates);
          return conflict;
        }
        
        // Update on server
        const { data, error } = await supabaseClient
          .from('habits')
          .update({ ...updates, updated_at: timestamp, should_sync: false })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        // If online update fails, queue for sync
        this.addToSyncQueue('update', 'habits', { id, ...updates, should_sync: true });
        return { id, ...updates, should_sync: true } as Habit;
      }
    } else {
      // Offline: queue for sync
      this.addToSyncQueue('update', 'habits', { id, ...updates, should_sync: true });
      return { id, ...updates, should_sync: true } as Habit;
    }
  }

  // Soft delete a habit
  async deleteHabit(id: number): Promise<void> {
    if (this.isOnline) {
      try {
        const { error } = await supabaseClient
          .from('habits')
          .update({ is_deleted: true, should_sync: false, updated_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        // If online delete fails, queue for sync
        this.addToSyncQueue('delete', 'habits', { id, is_deleted: true, should_sync: true });
      }
    } else {
      // Offline: queue for sync
      this.addToSyncQueue('delete', 'habits', { id, is_deleted: true, should_sync: true });
    }
  }

  // Process the sync queue when back online
  private async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(`Processing ${this.syncQueue.length} pending sync operations...`);

    for (const item of this.syncQueue) {
      try {
        switch (item.type) {
          case 'create':
            await this.syncCreate(item.table, item.data);
            break;
          case 'update':
            await this.syncUpdate(item.table, item.data);
            break;
          case 'delete':
            await this.syncDelete(item.table, item.data);
            break;
        }
      } catch (error) {
        console.error(`Failed to sync ${item.type} operation:`, error);
        // Keep failed items in queue for retry
        continue;
      }
    }

    // Clear successfully synced items
    this.syncQueue = this.syncQueue.filter(item => !item.success);
    this.lastSyncTime = new Date().toISOString();
  }

  private async syncCreate(table: string, data: any) {
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData?.user?.id) throw new Error('User not authenticated');

    const { error } = await supabaseClient
      .from(table)
      .insert([{ ...data, user_id: userData.user.id, should_sync: false }]);

    if (error) throw error;
  }

  private async syncUpdate(table: string, data: any) {
    const { error } = await supabaseClient
      .from(table)
      .update({ ...data, should_sync: false, updated_at: new Date().toISOString() })
      .eq('id', data.id);

    if (error) throw error;
  }

  private async syncDelete(table: string, data: any) {
    const { error } = await supabaseClient
      .from(table)
      .update({ is_deleted: true, should_sync: false, updated_at: new Date().toISOString() })
      .eq('id', data.id);

    if (error) throw error;
  }

  // Conflict resolution strategy
  private async resolveConflict(serverData: any, localData: any): Promise<any> {
    // Simple strategy: server wins for now
    // You could implement more sophisticated conflict resolution here
    console.warn('Conflict detected, server version wins:', { server: serverData, local: localData });
    return serverData;
  }

  private addToSyncQueue(type: 'create' | 'update' | 'delete', table: string, data: any) {
    this.syncQueue.push({ type, table, data });
    console.log(`Added ${type} operation to sync queue for ${table}`);
  }

  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return {
      lastSyncTime: this.lastSyncTime,
      isOnline: this.isOnline,
      pendingChanges: this.syncQueue.length
    };
  }

  // Force sync attempt
  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
