import { View, Text, Platform } from 'react-native';
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DexieDb } from '@/db/dexieDb';
import { SupabaseDb } from '@/db/supabaseDb';
import { HabitDatabaseInterface } from '@/db/types';
import { useAuth } from '@/db/AuthContext';

export type DataSourceType = 'local' | 'cloud';

interface DataSourceContextType {
  currentDataSource: DataSourceType;
  activeDb: HabitDatabaseInterface | null;
  isInitialized: boolean;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

interface DataSourceProviderProps {
  children: ReactNode;
}

export function DataSourceProvider({ children }: DataSourceProviderProps) {
  const isMobile = Platform.OS !== 'web';
  const [activeDb, setActiveDb] = useState<HabitDatabaseInterface | null>(null);
  const [currentDataSource, setCurrentDataSource] = useState<DataSourceType>('cloud');
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Use cloud database by default on both mobile and web
        const db = new SupabaseDb();
        setCurrentDataSource('cloud');
        setActiveDb(db);
        setIsInitialized(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Database initialization failed:', error);
        // Set initialized to true to prevent infinite loading
        setIsInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  // Switch database based on authentication state and invalidate queries (web only)
  useEffect(() => {
    if (!isInitialized || isMobile) return;

    const switchDatabase = async () => {
      if (isAuthenticated && currentDataSource === 'local') {
        // Switch to cloud database when user logs in (web only)
        try {
          const cloudDb = new SupabaseDb();
          setActiveDb(cloudDb);
          setCurrentDataSource('cloud');
          queryClient.invalidateQueries();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to switch to cloud database:', error);
        }
      } else if (!isAuthenticated && currentDataSource === 'cloud') {
        // Switch back to local when user logs out (web only)
        try {
          const localDb = new DexieDb();
          await localDb.getHabits();
          setActiveDb(localDb);
          setCurrentDataSource('local');
          queryClient.invalidateQueries();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to switch to local database:', error);
        }
      } else if (isInitialized && activeDb) {
        // Invalidate queries when authentication state changes (user change, etc.)
        queryClient.invalidateQueries();
      }
    };

    switchDatabase();
  }, [isAuthenticated, user, isInitialized, currentDataSource, activeDb, queryClient, isMobile]);

  const value: DataSourceContextType = {
    currentDataSource,
    activeDb,
    isInitialized,
  };

  // Show loading state while database initializes
  if (!isInitialized) {
    return (
      <DataSourceContext.Provider value={value}>
        <View style={{ 
          flex: 1,
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#000'
        }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>
            Initializing...
          </Text>
        </View>
      </DataSourceContext.Provider>
    );
  }

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}
