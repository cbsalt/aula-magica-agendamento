import { useSelectedTimes } from "@/hooks/useSelectedTimes";
import { formatDateString } from "@/utils";
import { parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
    // const zonedDate = toZonedTime(dayDate, TIMEZONE);
    zonedDate.setHours(hours, minutes, 0, 0);
    console.table({
      dayDate,
      zonedDate,
    });
    return zonedDate;
  };

  const isSlotSelected = (slot) => {
    const start = formatDateString(slot.start);
    console.log("TeacherAvailability_isSlotSelected", start);
    const zonedDate = getZonedSlotDate(day.date, start);
    return isTimeSlotSelected({ date: zonedDate, time: start });
  };

  const handleSlotClick = (slot) => {
    const start = formatDateString(slot.start);
    const zonedDate = getZonedSlotDate(day.date, start);
    handleSlot({ date: zonedDate, time: start });
  };

  return (
    <div className="space-y-2">
      <h4 className="text-1xl font-semibold text-gray-800">
        {t(`publicBooking.weekDays.${day.label}`)}
      </h4>

      <div className="flex flex-wrap gap-3 w-full">
        {day.slots.map((slot, i) => {
          const start = formatDateString(slot.start);
          const end = formatDateString(slot.end);
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
