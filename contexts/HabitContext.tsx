import React, { createContext, useContext, ReactNode } from 'react';
import Dexie, { Table } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

export interface Habit {
  id?: number;
  name: string;
}

export interface HabitCompletion {
  id?: number;
  habitId: number;
  date: string;
}

class HabitDatabase extends Dexie {
  habits!: Table<Habit>;
  habitCompletions!: Table<HabitCompletion>;

  constructor() {
    super('HabitDatabase');
    this.version(1).stores({
      habits: '++id',
      habitCompletions: '++id, habitId, date'
    });
  }
}

const db = new HabitDatabase();

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id'>) => Promise<void>;
  deleteHabit: (habitId: number) => Promise<void>;
  addHabitCompletion: (habitId: number, date: string) => Promise<void>;
  getHabitCompletions: (date: string) => Promise<number[]>;
  deleteHabitCompletion: (habitId: number, date: string) => Promise<void>;
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
      await db.habitCompletions.where('habitId').equals(habitId).delete();
      console.log('Habit deleted successfully');
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const addHabitCompletion = async (habitId: number, date: string) => {
    try {
      await db.habitCompletions.add({
        habitId,
        date,
      });
      console.log('Habit completion added successfully');
    } catch (error) {
      console.error('Failed to add habit completion:', error);
    }
  };

  const getHabitCompletions = async (date: string) => {
    try {
      const completions = await db.habitCompletions.where('date').equals(date).toArray();
      return completions.map(completion => completion.habitId);
    } catch (error) {
      console.error('Failed to get habit completions:', error);
      return [];
    }
  };

  const deleteHabitCompletion = async (habitId: number, date: string) => {
    try {
      await db.habitCompletions.where({ habitId, date }).delete();
      console.log('Habit completion deleted successfully for habitId:', habitId, 'and date:', date);
    } catch (error) {
      console.error('Failed to delete habit completion:', error);
    }
  };

  return (
    <HabitContext.Provider value={{ habits: allHabits || [], addHabit, deleteHabit, addHabitCompletion, getHabitCompletions, deleteHabitCompletion }}>
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
