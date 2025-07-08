import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/LanguageSelector";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { bookingSchema, BookingFormData } from "@/lib/validation";

const Booking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
  });

  const { availableTimes, isLoading, error } = useGoogleCalendar({
    selectedDate,
  });

  const watchedTime = watch("time");

  const onSubmit = (data: BookingFormData) => {
    if (!isValid) {
      toast({
        title: t("booking.requiredFields"),
        description: t("booking.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    // Store booking data for next page
    const bookingData = {
      email: data.email,
      name: data.name,
      date: data.date.toISOString(),
      time: data.time,
      price: 150.0,
    };

    localStorage.setItem("bookingData", JSON.stringify(bookingData));
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              {t("booking.title")}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {t("booking.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2 text-left">
                <Label htmlFor="email">{t("booking.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("booking.emailPlaceholder")}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">
                    {t(errors.email.message || "")}
                  </p>
                )}
              </div>

              {/* Name Input (Optional) */}
              <div className="space-y-2 text-left">
                <Label htmlFor="name">{t("booking.name")}</Label>
                <Input
                  id="name"
                  placeholder={t("booking.namePlaceholder")}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">
                    {t(errors.name.message || "")}
                  </p>
                )}
              </div>

              {/* Date Picker */}
              <div className="space-y-2 text-left">
                <Label>{t("booking.date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal p-3",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "dd/MM/yyyy")
                        : t("booking.datePlaceholder")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setValue("date", date, { shouldValidate: true });
                        }
                      }}
                      disabled={(date) =>
                        date < new Date() || date.getDay() === 0
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-red-600">
                    {t(errors.date.message || "")}
                  </p>
                )}
              </div>

              {/* Time Selector */}
              <div className="space-y-2 text-left">
                <Label>{t("booking.time")}</Label>
                <Select
                  value={watchedTime}
                  onValueChange={(value) =>
                    setValue("time", value, { shouldValidate: true })
                  }
                  disabled={!selectedDate || isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoading
                          ? t("booking.loadingTimes")
                          : t("booking.timePlaceholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("booking.loadingTimes")}
                        </div>
                      </SelectItem>
                    ) : availableTimes.length === 0 ? (
                      <SelectItem value="no-times" disabled>
                        {t("booking.noTimesAvailable")}
                      </SelectItem>
                    ) : (
                      availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.time && (
                  <p className="text-sm text-red-600">
                    {t(errors.time.message || "")}
                  </p>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              {/* Price Display */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t("booking.price")}</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ 150,00
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isValid}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg disabled:opacity-50"
              >
                {t("booking.continueToPayment")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
