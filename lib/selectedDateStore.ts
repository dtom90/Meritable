import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { getToday } from '@/lib/dateUtils';

interface SelectedDateState {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const selectedDateStore = create<SelectedDateState>((set) => ({
  selectedDate: getToday(),
  setSelectedDate: (date: string) =>
    set((state) => (state.selectedDate === date ? state : { selectedDate: date })),
}));

export function useSelectedDate() {
  return selectedDateStore(
    useShallow((state) => ({
      selectedDate: state.selectedDate,
      setSelectedDate: state.setSelectedDate,
    })),
  );
}
