import { t } from "i18next";
import { ArrowRight, Clock } from "lucide-react";
import { formatDateString } from "@/utils";

export function TeacherAvailability({ day, handleSlot, selectedTime }) {
  return (
    <div className="space-y-2">
      <h4 className="text-1xl font-semibold text-gray-800">
        {t(`publicBooking.weekDays.${day.label}`)}
      </h4>

      <div className="flex flex-wrap gap-3 w-full">
        {day.slots.map((slot, i) => {
          const start = formatDateString(slot.start);
          const end = formatDateString(slot.end);

          const isSelected = selectedTime === start;

          return (
            <button
              key={i}
              onClick={() => handleSlot(slot)}
              className={`flex w-[180px] items-center gap-2 justify-center py-2 rounded-md border text-sm font-medium transition-colors ${
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
