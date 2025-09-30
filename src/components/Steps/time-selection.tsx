import { Clock, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedCard from "./animated-card";
import { t } from "i18next";
import { TeacherAvailability } from "../Partials/TeacherAvailability";
import { capitalize } from "@/utils";
import toast from "react-hot-toast";

interface Props {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  teacherAvailability: [];
  onHandleSlot: (slot: { date: string; time: string }) => void;
  loadingAvailability: boolean;
  isRescheduleMode?: boolean;
  slotToUpdate;
}

export function TimeSelectionStep({
  selectedDate,
  onChangeDate,
  teacherAvailability,
  onHandleSlot,
  loadingAvailability,
  isRescheduleMode = false,
  slotToUpdate,
}: Props) {
  const changeDate = (days: number) => {
    if (!loadingAvailability) {
      onChangeDate(addDays(selectedDate, days));
    }
  };

  const dayName = capitalize(format(selectedDate, "EEEE", { locale: ptBR }));

  const CalendarHeader = () => (
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
        {t(`publicBooking.weekDays.${dayName}`)} -{" "}
        {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
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
    return <Skeleton className="w-full h-full border border-gray-200" />;
  }

  if (teacherAvailability.length === 0) {
    return (
      <AnimatedCard>
        <CalendarHeader />
        <CardContent className="flex flex-col items-center justify-center text-center py-12">
          <Clock className="h-8 w-8 text-gray-400 mb-3" />
          <p className="text-gray-600 text-sm md:text-base max-w-xs">
            {t("publicBooking.noAvailableTimes")}
          </p>
        </CardContent>
      </AnimatedCard>
    );
  }

  const handleSlotWrapped = (slot: { date: string; time: string }) => {
    if (isRescheduleMode && !slotToUpdate.length) {
      toast(t("publicBooking.reschedule.selectTime"), {
        icon: <Info size={48} />,
        duration: 5000,
        position: "top-center",
      });
      return;
    }

    onHandleSlot(slot);
  };

  return (
    <AnimatedCard>
      <CalendarHeader />
      <CardContent>
        <div className="space-y-8">
          {teacherAvailability.map((day) => (
            <TeacherAvailability
              key={day}
              day={day}
              handleSlot={handleSlotWrapped}
            />
          ))}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
