import { useSelectedTimes } from "@/hooks/useSelectedTimes";
import { ArrowRight, Clock, Info, X } from "lucide-react";
import { useState } from "react";

interface Props {
  day: {
    date: string;
    slots: Array<{ start: string; end: string }>;
  };
  handleSlot: (slot: { date: string; time: string }) => void;
}

export function TeacherAvailability({ day, handleSlot }: Props) {
  const { isTimeSlotSelected } = useSelectedTimes();

  const isSlotSelected = (slot: { start: string }) => {
    return isTimeSlotSelected({ date: day.date, time: slot.start });
  };

  const handleSlotClick = (slot: { start: string }) => {
    handleSlot({ date: day.date, time: slot.start });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-start gap-3 w-full lg:gap-y-3 lg:justify-between">
        {day.slots.map((slot, i) => {
          const start = slot.start;
          const end = slot.end;
          const isSelected = isSlotSelected(slot);

          return (
            <button
              key={i}
              onClick={() => handleSlotClick(slot)}
              className={`flex w-full sm:w-[180px] items-center gap-2 justify-center py-2 rounded-md border text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-primary text-white border-primary"
                  : "border-primary text-primary hover:bg-primary hover:text-white"
              }`}
              aria-pressed={isSelected}
            >
              <Clock className="h-4 w-4" />
              <span>{start}</span>

              <ArrowRight className="h-4 w-4" />
              <span>{end}</span>

              {isSelected && <X className="h-4 w-4 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
