"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTeacherAvailability } from "@/services/teacherService";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import LanguageSelector from "@/components/LanguageSelector";
import { SelectedTimesProvider } from "@/contexts/SelectedTimesContext";
import { useSelectedTimes } from "@/hooks/useSelectedTimes";
import { createBooking } from "@/services/paymentService";
import { Teacher } from "@prisma/client";
import { useTranslation } from "react-i18next";
import SelectedTimesDrawer from "./SelectedTimesDrawer";
import DateSelectionStep from "./Steps/date-selection";
import PaymentStep from "./Steps/payment";
import { StudentInfoFormData, StudentInfoStep } from "./Steps/student-info";
import { TimeSelectionStep } from "./Steps/time-selection";

interface Props {
  teacher: Teacher;
}

function PublicBookingPageContent({ teacher }: Props) {
  const { t } = useTranslation();
  const { selectedTimes, addTimeSlot, removeTimeSlot, isTimeSlotSelected } =
    useSelectedTimes();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [teacherAvailability, setTeacherAvailability] = useState([] as []);
  const [studentData, setStudentData] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"dateTime" | "info" | "payment">("dateTime");
  const [error, setError] = useState<string | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const steps = ["dateTime", "info", "payment"];
  const currentStepIndex = steps.indexOf(step);

  const [studentPaymentMethod, setStudentPaymentMethod] = useState<
    "creditCard" | "paypal"
  >("creditCard");

  const fetchAvailability = useCallback(
    async (selectedDate: Date) => {
      setLoadingAvailability(true);

      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        const data = await fetchTeacherAvailability(teacher.id);

        const filteredAvailability = data.availability
          .filter((day) => day.date === formattedDate)
          .map((day) => ({
            ...day,
            slots: day.slots.map((slot) => ({
              ...slot,
              time: new Date(slot.start).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            })),
          }));

        setTeacherAvailability(filteredAvailability);
      } catch (error) {
        console.error("Erro ao buscar disponibilidade:", error);
      } finally {
        setLoadingAvailability(false);
      }
    },
    [teacher.id, setLoadingAvailability]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, fetchAvailability]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const onSubmit = (data: StudentInfoFormData) => {
    setStudentData(data);
    setStep("payment");
  };

  const handleBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      let payload;

      if (selectedTimes.length > 1) {
        payload = {
          teacherId: teacher.id,
          studentName: studentData.name,
          studentEmail: studentData.email,
          timeSlots: selectedTimes.map((timeSlot) => ({
            date: format(timeSlot.date, "yyyy-MM-dd"),
            time: timeSlot.time,
          })),
          studentPaymentMethod,
        };
      } else {
        payload = {
          teacherId: teacher.id,
          studentName: studentData.name,
          studentEmail: studentData.email,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTimes[0]?.time || "",
          studentPaymentMethod,
        };
      }

      const result = await createBooking(payload);

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        setError("Erro inesperado ao redirecionar para o pagamento.");
      }
    } catch (error) {
      setError(error?.response?.data?.error || "Erro ao criar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduledSlot = (slot: { date: Date; time: string }) => {
    if (isTimeSlotSelected(slot)) {
      removeTimeSlot(slot);
    } else {
      addTimeSlot(slot);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        {/* Teacher Info */}
        <Card className="mb-8 shadow-lg border border-gray-200">
          <CardHeader>
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 ring-2 ring-primary ring-offset-2">
                <AvatarImage src={teacher.photo} alt={teacher.name} />
                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col justify-center">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  {teacher.name}
                </CardTitle>

                <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                  {teacher.description}
                </p>

                <div className="mt-2 inline-flex items-center text-sm font-medium text-green-600">
                  <div className="text-gray-600 mr-1">
                    {t(`publicBooking.price`)}:
                  </div>
                  {teacher.price.toFixed(2)} {teacher.currency}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
            {steps.map((s, index) => (
              <div
                key={s}
                className={`flex-1 text-center ${
                  index === currentStepIndex ? "text-primary font-semibold" : ""
                }`}
              >
                {t(`publicBooking.stepLabels.${s}`)}
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Booking Steps */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-6 justify-center">
          {/* Step 1: Date Selection */}
          {step === "dateTime" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1: calendário */}
              <DateSelectionStep
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
              />

              {/* Coluna 2: horários */}
              {selectedDate && (
                <TimeSelectionStep
                  selectedDate={selectedDate}
                  onChangeDate={(newDate) => {
                    setSelectedDate(newDate);
                  }}
                  error={error}
                  teacherAvailability={teacherAvailability}
                  selectedTimes={selectedTimes}
                  handleSlot={handleScheduledSlot}
                  loadingAvailability={loadingAvailability}
                />
              )}
            </div>
          )}

          {/* Step 3: Student Info */}
          {step === "info" && <StudentInfoStep onSubmit={onSubmit} />}

          {/* Step 4: Payment */}
          {step === "payment" && (
            <PaymentStep
              teacher={teacher}
              selectedTimes={selectedTimes}
              studentData={studentData}
              studentPaymentMethod={studentPaymentMethod}
              setStudentPaymentMethod={setStudentPaymentMethod}
              handleBooking={handleBooking}
              loading={loading}
            />
          )}
        </div>
        {/* Navigation */}
        <div className="space-y-4 mt-2">
          {step !== "dateTime" && (
            <Button
              variant="outline"
              onClick={() => setStep(step === "info" ? "dateTime" : "info")}
              className="w-full md:w-auto"
            >
              {t("publicBooking.back")}
            </Button>
          )}
        </div>
      </div>

      <SelectedTimesDrawer
        teacher={teacher}
        onContinue={() => setStep("info")}
      />
    </div>
  );
}

export default function PublicBookingPage({ teacher }: Props) {
  return (
    <SelectedTimesProvider>
      <PublicBookingPageContent teacher={teacher} />
    </SelectedTimesProvider>
  );
}
