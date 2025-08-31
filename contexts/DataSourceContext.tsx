import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { DexieDb } from '@/db/dexieDb';
import { SupabaseDb } from '@/db/supabaseDb';
import { HabitDatabaseInterface } from '@/db/types';

export type DataSourceType = 'local' | 'cloud';
const defaultDataSource: DataSourceType = process.env.DATA_SOURCE === 'cloud' ? 'cloud' : 'local';

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
  const [currentDataSource, setCurrentDataSource] = useState<DataSourceType>(defaultDataSource);

  // Initialize database instances once, not on every render
  const [localDb] = useState(() => new DexieDb());
  const [cloudDb] = useState(() => new SupabaseDb());

  // Get active database based on current source - memoized to prevent unnecessary re-renders
  const activeDb = useMemo((): HabitDatabaseInterface => {
    return currentDataSource === 'cloud' ? cloudDb : localDb;
  }, [currentDataSource, cloudDb, localDb]);

  const value: DataSourceContextType = {
    currentDataSource,
    setDataSource: setCurrentDataSource,
    activeDb,
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
