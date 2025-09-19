import { useSelectedTimes } from "@/hooks/useSelectedTimes";
import { parse } from "date-fns";
import { t } from "i18next";
import { ArrowRight, Clock, X } from "lucide-react";

interface Props {
  day;
  handleSlot: (slot: { date: Date; time: string }) => void;
  selectedTimes: Array<{ date: Date; time: string }>;
}

const TIMEZONE = "America/Sao_Paulo";

export function TeacherAvailability({ day, handleSlot, selectedTimes }: Props) {
  const { isTimeSlotSelected } = useSelectedTimes();

  const getZonedSlotDate = (dayDate: string, slotStart: string) => {
    const [hours, minutes] = slotStart.split(":").map(Number);
    const zonedDate = parse(dayDate, "yyyy-MM-dd", new Date());
    zonedDate.setHours(hours, minutes, 0, 0);
    return zonedDate;
  };

  const isSlotSelected = (slot) => {
    const start = slot.start;
    const zonedDate = getZonedSlotDate(day.date, start);
    return isTimeSlotSelected({ date: zonedDate, time: start });
  };

  const handleSlotClick = (slot) => {
    const start = slot.start;
    const zonedDate = getZonedSlotDate(day.date, start);
    handleSlot({ date: zonedDate, time: start });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3 w-full">
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
