import { useState } from "react";

export const weekDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda", value: 1 },
  { label: "Terça", value: 2 },
  { label: "Quarta", value: 3 },
  { label: "Quinta", value: 4 },
  { label: "Sexta", value: 5 },
  { label: "Sábado", value: 6 },
];

export function useTeacherData(initialData) {
  const [workSchedule, setWorkSchedule] = useState(() =>
    weekDays.map((day) => {
      const found = initialData?.find((d) => d.dayOfWeek === day.value);
      return found
        ? {
            dayOfWeek: day.value,
            startTime: found.startTime,
            endTime: found.endTime,
            startInterval: found.startInterval,
            endInterval: found.endInterval,
          }
        : {
            dayOfWeek: day.value,
            startTime: "",
            endTime: "",
            startInterval: "",
            endInterval: "",
          };
    })
  );

  return {
    workSchedule,
    setWorkSchedule,
    weekDays,
  };
}
