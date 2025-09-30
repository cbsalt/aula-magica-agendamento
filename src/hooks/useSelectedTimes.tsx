import { createContext, useContext } from "react";

export interface TimeSlot {
  id?: string;
  date: string;
  time: string;
}

interface SelectedTimesContextType {
  selectedTimes: TimeSlot[];
  addTimeSlot: (timeSlot: TimeSlot, replace?: boolean) => void;
  removeTimeSlot: (timeSlot: TimeSlot) => void;
  clearSelectedTimes: () => void;
  isTimeSlotSelected: (timeSlot: TimeSlot) => boolean;
}

export const SelectedTimesContext = createContext<
  SelectedTimesContextType | undefined
>(undefined);

export function useSelectedTimes() {
  const context = useContext(SelectedTimesContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedTimes must be used within a SelectedTimesProvider"
    );
  }
  return context;
}
