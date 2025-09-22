"use client";

import { SelectedTimesContext } from "@/hooks/useSelectedTimes";
import { setHours, setMinutes } from "date-fns";
import { ReactNode, useState } from "react";

interface TimeSlot {
  date: Date;
  time: string;
}

export function SelectedTimesProvider({ children }: { children: ReactNode }) {
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([]);

  const normalize = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return setMinutes(setHours(date, hours), minutes);
  };

  const addTimeSlot = (timeSlot: TimeSlot) => {
    const normalizedDate = normalize(timeSlot.date, timeSlot.time);

    setSelectedTimes((prev) => [
      ...prev,
      { date: normalizedDate, time: timeSlot.time },
    ]);
  };

  const removeTimeSlot = (timeSlot: TimeSlot) => {
    const normalizedDate = normalize(timeSlot.date, timeSlot.time);

    setSelectedTimes((prev) =>
      prev.filter(
        (selected) =>
          !(
            selected.date.getTime() === normalizedDate.getTime() &&
            selected.time === timeSlot.time
          )
      )
    );
  };

  const clearSelectedTimes = () => {
    setSelectedTimes([]);
  };

  const isTimeSlotSelected = (timeSlot: TimeSlot) => {
    const normalizedDate = normalize(timeSlot.date, timeSlot.time);

    return selectedTimes.some(
      (selected) =>
        selected.date.getTime() === normalizedDate.getTime() &&
        selected.time === timeSlot.time
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
