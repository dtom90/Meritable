import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useOfflineSync } from '../db/useOfflineSync';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export const SyncStatus: React.FC = () => {
  const { syncStatus, isSyncing, forceSync, isOnline, pendingChanges } = useOfflineSync();

  const handleSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return '#f59e0b'; // Yellow for offline
    if (pendingChanges > 0) return '#ef4444'; // Red for pending changes
    return '#10b981'; // Green for synced
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (pendingChanges > 0) return `${pendingChanges} pending`;
    return 'Synced';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
      </View>
      
      {pendingChanges > 0 && isOnline && (
        <TouchableOpacity 
          style={styles.syncButton} 
          onPress={handleSync}
          disabled={isSyncing}
        >
          <ThemedText style={styles.syncButtonText}>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </ThemedText>
        </TouchableOpacity>
      )}
      
      {syncStatus.lastSyncTime && (
        <ThemedText style={styles.lastSyncText}>
          Last sync: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  lastSyncText: {
    fontSize: 12,
    opacity: 0.7,
  },
});
