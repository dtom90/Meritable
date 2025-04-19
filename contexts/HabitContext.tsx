import React, { createContext, useContext, ReactNode } from 'react';
import Dexie, { Table } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

export interface Habit {
  id?: number;
  name: string;
}

class HabitDatabase extends Dexie {
  habits!: Table<Habit>;

  constructor() {
    super('HabitDatabase');
    this.version(1).stores({
      habits: '++id'
    });
  }
}

const db = new HabitDatabase();

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  deleteHabit: (habitId: number) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

interface HabitProviderProps {
  children: ReactNode;
}

export const HabitProvider: React.FC<HabitProviderProps> = ({ children }) => {
  const allHabits = useLiveQuery(() => db.habits.toArray(), []);

  const addHabit = async (habitData: Omit<Habit, 'id'>) => {
    try {
      await db.habits.add({
        ...habitData,
      });
      console.log('Habit added successfully');
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  };

  const deleteHabit = async (habitId: number) => {
    try {
      await db.habits.delete(habitId);
      console.log('Habit deleted successfully');
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  return (
    <HabitContext.Provider value={{ habits: allHabits || [], addHabit, deleteHabit }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
