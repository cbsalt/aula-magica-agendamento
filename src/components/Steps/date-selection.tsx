import { Calendar } from "@/components/ui/calendar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedCard from "./animated-card";

interface Props {
  isRescheduleMode: boolean;
  selectedDate?: Date;
  onSelect: (date: Date | undefined) => void;
}

const DateSelectionStep = ({
  isRescheduleMode,
  selectedDate,
  onSelect,
}: Props) => {
  const { t } = useTranslation();

  const baseDate = selectedDate ?? new Date();
  const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

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
          month={isRescheduleMode ? monthDate : undefined}
          onSelect={onSelect}
          disabled={(date) =>
            isBefore(startOfDay(date), startOfDay(new Date()))
          }
          className="rounded-lg border border-gray-300"
        />
      </CardContent>
    </AnimatedCard>
  );
};

export default DateSelectionStep;
