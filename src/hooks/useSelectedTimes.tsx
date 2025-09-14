import { createContext, useContext } from "react";

interface TimeSlot {
  date: Date;
  time: string;
}

interface SelectedTimesContextType {
  selectedTimes: TimeSlot[];
  addTimeSlot: (timeSlot: TimeSlot) => void;
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
