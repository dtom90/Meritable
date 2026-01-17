import { View, Platform } from 'react-native';
import React, { createContext, useContext, ReactNode, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DexieDb } from '@/db/dexieDb';
import { AsyncStorageDb } from '@/db/asyncStorageDb';
import { SupabaseDb } from '@/db/supabaseDb';
import { HabitDatabaseInterface } from '@/db/habitDatabase';
import { useAuth } from '@/db/AuthContext';
import Spinner from '@/components/Spinner';

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
  const [currentDataSource, setCurrentDataSource] = useState<DataSourceType>(
    'local'
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Wait for auth to complete before initializing DB
  useEffect(() => {
    if (authLoading) return; // Don't initialize until auth is ready

    const initializeDatabase = async () => {
      try {
        // Initialize based on auth state from the start
        if (isAuthenticated) {
          // User is authenticated, initialize cloud DB directly
          const cloudDb = new SupabaseDb();
          cloudDb.setOnFetchingStateChange(setIsFetchingUser);
          
          // Pre-fetch user to avoid lazy loading spinner
          setIsFetchingUser(true);
          try {
            await cloudDb.initialize(); // This will trigger getUser() internally
          } finally {
            if (isMountedRef.current) {
              setIsFetchingUser(false);
            }
          }
          
          if (isMountedRef.current) {
            setActiveDb(cloudDb);
            setCurrentDataSource('cloud');
            setIsInitialized(true);
            queryClient.invalidateQueries();
          }
        } else {
          // User not authenticated, use local DB
          if (isMobile) {
            const localDb = new AsyncStorageDb();
            await localDb.getHabits();
            if (isMountedRef.current) {
              setActiveDb(localDb);
              setCurrentDataSource('local');
              setIsInitialized(true);
              queryClient.invalidateQueries();
            }
          } else {
            const db = new DexieDb();
            if (isMountedRef.current) {
              setActiveDb(db);
              setCurrentDataSource('local');
              setIsInitialized(true);
              queryClient.invalidateQueries();
            }
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Database initialization failed:', error);
        // Set initialized to true to prevent infinite loading
        if (isMountedRef.current) {
          setIsInitialized(true);
        }
      }
    };

    initializeDatabase();
  }, [authLoading, isAuthenticated, isMobile, queryClient]);

  // Simplified switch effect - only handles auth state changes after initialization
  useEffect(() => {
    if (!isInitialized || authLoading) return;

    const switchDatabase = async () => {
      if (isAuthenticated && currentDataSource === 'local') {
        // Switch to cloud database when user logs in
        try {
          const cloudDb = new SupabaseDb();
          cloudDb.setOnFetchingStateChange(setIsFetchingUser);
          
          setIsFetchingUser(true);
          try {
            await cloudDb.initialize(); // Pre-fetch user
          } finally {
            if (isMountedRef.current) {
              setIsFetchingUser(false);
            }
          }
          
          if (isMountedRef.current) {
            setActiveDb(cloudDb);
            setCurrentDataSource('cloud');
            queryClient.invalidateQueries();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to switch to cloud database:', error);
          if (isMountedRef.current) {
            setIsFetchingUser(false);
          }
        }
      } else if (!isAuthenticated && currentDataSource === 'cloud') {
        // Switch back to local when user logs out
        try {
          const localDb = isMobile ? new AsyncStorageDb() : new DexieDb();
          await localDb.getHabits();
          if (isMountedRef.current) {
            setActiveDb(localDb);
            setCurrentDataSource('local');
            setIsFetchingUser(false);
            queryClient.invalidateQueries();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to switch to local database:', error);
        }
      }
    };

    switchDatabase();
  }, [isAuthenticated, isInitialized, authLoading, currentDataSource, isMobile, queryClient]);

  const value: DataSourceContextType = {
    currentDataSource,
    activeDb,
    isInitialized,
  };

  // Show loading state while auth is loading, database initializes, or fetching user info
  if (authLoading || !isInitialized || isFetchingUser) {
    return (
      <DataSourceContext.Provider value={value}>
        <View style={{ 
          flex: 1,
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#000'
        }}>
          <Spinner />
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
