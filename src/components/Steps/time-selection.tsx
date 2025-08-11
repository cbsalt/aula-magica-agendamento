import { Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedCard from "./animated-card";
import { t } from "i18next";

interface Props {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  error: string;
  teacherAvailability: any[];
  selectedTime: string;
  handleSlot: (slot: any) => void;
  loadingAvailability: boolean;
}

export function TimeSelectionStep({
  selectedDate,
  onChangeDate,
  error,
  teacherAvailability,
  selectedTime,
  handleSlot,
  loadingAvailability,
}: Props) {
  const changeDate = (days: number) => {
    if (!loadingAvailability) {
      onChangeDate(addDays(selectedDate, days));
    }
  };

  const CalendarHeader = ({ title }: { title: string }) => (
    <CardHeader className="flex flex-row items-center justify-center">
      <button
        disabled={
          loadingAvailability ||
          isBefore(
            startOfDay(addDays(selectedDate, -1)),
            startOfDay(new Date())
          )
        }
        onClick={() => onChangeDate(addDays(selectedDate, -1))}
        className="mt-1.5 p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition flex items-center justify-center"
      >
        <ChevronLeft className="h-6 w-6 text-primary" />
      </button>

      <CardTitle className="flex items-center text-center text-base md:text-lg font-semibold text-gray-800">
        <Clock className="mr-2 h-5 w-5 text-primary" />
        {title} – {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
      </CardTitle>

      <button
        disabled={loadingAvailability}
        onClick={() => changeDate(1)}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition flex items-center justify-center"
      >
        <ChevronRight className="h-6 w-6 text-primary" />
      </button>
    </CardHeader>
  );

  if (loadingAvailability) {
    return <Skeleton className="w-full h-[320px] border border-gray-200" />;
  }

  if (error) {
    return (
      <AnimatedCard>
        <CalendarHeader title={t("error")} />
      </AnimatedCard>
    );
  }

  if (teacherAvailability.length === 0) {
    return (
      <AnimatedCard>
        <CalendarHeader title={t("publicBooking.noAvailableTimes")} />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard>
      <CalendarHeader title={t("publicBooking.chooseTime")} />
      <CardContent>
        <div className="space-y-8">
          {teacherAvailability.map((day, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800">
                {t(`publicBooking.weekDays.${day.label}`)}
              </h4>
              <div className="flex flex-wrap gap-3">
                {day.slots.map((slot, i) => {
                  const start = new Date(slot.start).toLocaleTimeString(
                    "pt-BR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );
                  const end = new Date(slot.end).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const isSelected = selectedTime === start;

                  return (
                    <button
                      key={i}
                      onClick={() => handleSlot(slot)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "border-primary text-primary hover:bg-primary hover:text-white"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <Clock className="h-4 w-4" />
                      <span>{start}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{end}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
