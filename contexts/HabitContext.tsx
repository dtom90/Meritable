import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the Habit type (updated)
export interface Habit {
  id: string;
  text: string; // Changed from name
  completed: boolean; // Added
}

// Define the context type (updated action signature)
interface HabitContextType {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>; // Keep setHabits if direct manipulation is needed
  addHabit: (habitData: Omit<Habit, 'id'>) => void; // Action now expects { text: string; completed: boolean; }
}

// Create the context with a default value
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Create the Provider component
interface HabitProviderProps {
  children: ReactNode;
}

export const HabitProvider: React.FC<HabitProviderProps> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);

  // Updated action to add a new habit
  const addHabit = (habitData: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      id: Date.now().toString(), // Simple unique ID generation
      ...habitData, // Corrected spread syntax
    };
    setHabits(prevHabits => [...prevHabits, newHabit]);
  };

  const value = {
    habits,
    setHabits, // Provide setHabits if needed
    addHabit, // Provide the action
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};

// Create a custom hook for easy consumption
export const useHabits = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
