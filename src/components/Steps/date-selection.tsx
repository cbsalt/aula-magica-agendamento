import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { AnimatedCard } from "./animated-card";
import { Calendar, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { TeacherWorkSchedule } from "@prisma/client";
import { groupByDaysOfWeek } from "@/utils";

interface Props {
  isRescheduleMode: boolean;
  selectedDate?: Date;
  onSelect: (date: Date | undefined) => void;
  workScheduleTeacher?: Partial<TeacherWorkSchedule>[];
}

export const DateSelectionStep = ({
  isRescheduleMode,
  selectedDate,
  workScheduleTeacher,
  onSelect,
}: Props) => {
  const { t } = useTranslation();
  const [markedDays, setMarkedDays] = useState<Date[] | []>(() =>
    groupByDaysOfWeek(workScheduleTeacher, new Date())
  );

  const loadWorkScheduleTeacher = useCallback(
    (dateMonth: Date) => {
      const daysMarkedMonth = groupByDaysOfWeek(workScheduleTeacher, dateMonth);
      setMarkedDays(daysMarkedMonth);
    },
    [workScheduleTeacher]
  );

  const baseDate = selectedDate ?? new Date();
  const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const disabledCalendar = (date) =>
    isBefore(startOfDay(date), startOfDay(new Date()));
  const selectedMonth = isRescheduleMode ? monthDate : undefined;

  return (
    <AnimatedCard>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
          <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
          {t("publicBooking.chooseDate")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          month={selectedMonth}
          disabled={disabledCalendar}
          className="rounded-lg border border-gray-300"
          markedDays={markedDays}
          onSelect={onSelect}
          loadWorkScheduleTeacher={loadWorkScheduleTeacher}
        />
      </CardContent>
    </AnimatedCard>
  );
};
