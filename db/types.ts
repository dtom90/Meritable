
export interface Habit {
  id?: number;
  name: string;
  isDeleted: boolean;
  shouldSync: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  local_id?: string; // For tracking records created offline
  version?: number; // For conflict resolution
}

export interface HabitCompletion {
  id?: number;
  habitId: number;
  completionDate: string;
  isDeleted: boolean;
  shouldSync: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  local_id?: string; // For tracking records created offline
  version?: number; // For conflict resolution
}

// Sync status types
export interface SyncStatus {
  lastSyncTime: string;
  isOnline: boolean;
  pendingChanges: number;
}

// Conflict resolution types
export interface SyncConflict {
  localRecord: Habit | HabitCompletion;
  remoteRecord: Habit | HabitCompletion;
  conflictType: 'update' | 'delete' | 'create';
}
