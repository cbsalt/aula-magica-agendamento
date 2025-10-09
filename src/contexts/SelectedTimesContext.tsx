"use client";

import { SelectedTimesContext } from "@/hooks/useSelectedTimes";
import { ReactNode, useState } from "react";

interface TimeSlot {
  date: string;
  time: string;
}

export function SelectedTimesProvider({ children }: { children: ReactNode }) {
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([]);

  const addTimeSlot = (timeSlot: TimeSlot, replace = false) => {
    setSelectedTimes((prev) => {
      if (replace) {
        return [timeSlot];
      }

      return [...prev, timeSlot];
    });
  };

  const removeTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimes((prev) =>
      prev.filter(
        (selected) =>
          !(selected.date === timeSlot.date && selected.time === timeSlot.time)
      )
    );
  };

  const clearSelectedTimes = () => {
    setSelectedTimes([]);
  };

  const isTimeSlotSelected = (timeSlot: TimeSlot) => {
    return selectedTimes.some(
      (selected) =>
        selected.date === timeSlot.date && selected.time === timeSlot.time
    );
  };

  return (
    <SelectedTimesContext.Provider
      value={{
        selectedTimes,
        addTimeSlot,
        removeTimeSlot,
        clearSelectedTimes,
        isTimeSlotSelected,
      }}
    >
      {children}
    </SelectedTimesContext.Provider>
  );
}
