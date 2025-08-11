import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService } from './offlineSync';
import { SyncStatus } from './types';

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: new Date().toISOString(),
    isOnline: navigator.onLine,
    pendingChanges: 0
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Update sync status periodically
  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(offlineSyncService.getSyncStatus());
    };

    // Update immediately
    updateStatus();

    // Update every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for network changes
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const forceSync = useCallback(async () => {
    if (!syncStatus.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    setIsSyncing(true);
    try {
      await offlineSyncService.forceSync();
      // Update status after sync
      setSyncStatus(offlineSyncService.getSyncStatus());
    } finally {
      setIsSyncing(false);
    }
  }, [syncStatus.isOnline]);

  return {
    syncStatus,
    isSyncing,
    forceSync,
    isOnline: syncStatus.isOnline,
    pendingChanges: syncStatus.pendingChanges,
    lastSyncTime: syncStatus.lastSyncTime
  };
};
