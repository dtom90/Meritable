import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DexieDb } from '@/db/dexieDb';
import { SupabaseDb } from '@/db/supabaseDb';
import { HabitDatabaseInterface } from '@/db/types';

export type DataSourceType = 'local' | 'cloud';

interface DataSourceContextType {
  // Current data source
  currentDataSource: DataSourceType;
  setDataSource: (source: DataSourceType) => void;
  
  // Active database interface
  activeDb: HabitDatabaseInterface;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

interface DataSourceProviderProps {
  children: ReactNode;
}

export function DataSourceProvider({ children }: DataSourceProviderProps) {
  const [currentDataSource, setCurrentDataSource] = useState<DataSourceType>('cloud');

  // Initialize database instances
  const localDb = new DexieDb();
  const cloudDb = new SupabaseDb();

  // Get active database based on current source
  const getActiveDb = (): HabitDatabaseInterface => {
    return currentDataSource === 'cloud' ? cloudDb : localDb;
  };

  const value: DataSourceContextType = {
    currentDataSource,
    setDataSource: setCurrentDataSource,
    activeDb: getActiveDb(),
  };

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
