"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fetchTeacherAvailability } from "@/services/teacherService";
import { motion } from "framer-motion";

import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { createBooking } from "@/services/paymentService";
import DateSelectionStep from "./Steps/date-selection";
import { TimeSelectionStep } from "./Steps/time-selection";
import { StudentInfoFormData, StudentInfoStep } from "./Steps/student-info";
import PaymentStep from "./Steps/payment";
import { ITeacher } from "./interfaces";

interface Props {
  teacher: ITeacher;
}

export default function PublicBookingPage({ teacher }: Props) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [teacherAvailability, setTeacherAvailability] = useState<any>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [studentData, setStudentData] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"date" | "time" | "info" | "payment">(
    "date"
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const steps = ["date", "time", "info", "payment"];
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
          .filter((slot: any) => slot.date === formattedDate)
          .map((slot: any) => ({
            ...slot,
            time: new Date(slot.start).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
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
    setSelectedTime("");
    setStep("time");
  };

  const onSubmit = (data: StudentInfoFormData) => {
    setStudentData(data);
    setStep("payment");
  };

  const handleBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        teacherId: teacher.id,
        studentName: studentData.name,
        studentEmail: studentData.email,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        studentPaymentMethod,
      };

      const result = await createBooking(payload);

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl; // redireciona para o Stripe Checkout
      } else {
        setError("Erro inesperado ao redirecionar para o pagamento.");
      }
    } catch (error: any) {
      setError(error?.response?.data?.error || "Erro ao criar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduledSlot = (slot: any) => {
    const formmatedSlot = `${format(slot.start, "HH:mm")} - ${format(
      slot.end,
      "HH:mm"
    )}`;

    setSelectedTime(formmatedSlot);
    setStep("info");
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
          {step === "date" && (
            <DateSelectionStep
              selectedDate={selectedDate}
              onSelect={handleDateSelect}
            />
          )}

          {/* Step 2: Time Selection */}
          {step === "time" && selectedDate && (
            <TimeSelectionStep
              selectedDate={selectedDate}
              onChangeDate={(newDate) => {
                setSelectedDate(newDate);
                setSelectedTime("");
              }}
              error={error}
              teacherAvailability={teacherAvailability}
              selectedTime={selectedTime}
              handleSlot={handleScheduledSlot}
              loadingAvailability={loadingAvailability}
            />
          )}

          {/* Step 3: Student Info */}
          {step === "info" && <StudentInfoStep onSubmit={onSubmit} />}

          {/* Step 4: Payment */}
          {step === "payment" && (
            <PaymentStep
              teacher={teacher}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
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
          {step !== "date" && (
            <Button
              variant="outline"
              onClick={() =>
                setStep(
                  step === "time" ? "date" : step === "info" ? "time" : "info"
                )
              }
              className="w-full md:w-auto"
            >
              {t("publicBooking.back")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
