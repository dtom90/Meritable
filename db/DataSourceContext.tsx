import { Platform, View, Text } from 'react-native';
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DexieDb } from '@/db/dexieDb';
import { SupabaseDb } from '@/db/supabaseDb';
import { HabitDatabaseInterface } from '@/db/types';
import { useAuth } from '@/db/AuthContext';

export type DataSourceType = 'local' | 'cloud';

const dataSource: DataSourceType = Platform.OS === 'web' && __DEV__ ? 'local' : 'cloud';

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
  const [activeDb, setActiveDb] = useState<HabitDatabaseInterface | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        let db: HabitDatabaseInterface;
        
        if (dataSource === 'cloud') {
          db = new SupabaseDb();
        } else {
          // Only create DexieDb on web dev
          if (Platform.OS === 'web' && __DEV__) {
            db = new DexieDb();
          } else {
            // Fallback to SupabaseDb if somehow we're not in web dev
            // eslint-disable-next-line no-console
            console.warn('Unexpected platform for local database, falling back to cloud');
            db = new SupabaseDb();
          }
        }
        
        // Test the database connection (only for local DB)
        if (dataSource === 'local') {
          await db.getHabits();
        }
        
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

  // Invalidate queries when authentication state changes
  useEffect(() => {
    if (isInitialized && activeDb) {
      // Invalidate all queries when user logs in or out
      queryClient.invalidateQueries();
    }
  }, [isAuthenticated, user, isInitialized, activeDb, queryClient]);

  const value: DataSourceContextType = {
    currentDataSource: dataSource,
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
