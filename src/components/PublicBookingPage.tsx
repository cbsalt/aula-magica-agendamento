"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { api, fetchTeacherAvailability } from "@/services/teacherService";
import { TimeSlotGrid } from "@/components/TimeSlotGrid";
import CardPaymentForm from "@/components/PaymentForms/CardPaymentForm";
import PaypalPaymentForm from "@/components/PaymentForms/PaypalPaymentForm";
import LanguageSelector from "@/components/LanguageSelector";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

interface Teacher {
  id: string;
  name: string;
  email: string;
  photo?: string;
  description?: string;
  price: number;
  currency: string;
  paymentConfig?: {
    defaultMethod: string;
  };
}

interface Props {
  teacher: Teacher;
}

export default function PublicBookingPage({ teacher }: Props) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availability, setAvailability] = useState<any>({
    availability: [],
    events: [],
  });
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"date" | "time" | "info" | "payment">(
    "date"
  );
  const [error, setError] = useState<string | null>(null);

  const [studentPaymentMethod, setStudentPaymentMethod] = useState<
    "stripe" | "paypal"
  >("stripe");
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate]);

  const fetchAvailability = async () => {
    try {
      const data = await fetchTeacherAvailability(
        teacher.id,
        format(selectedDate!, "yyyy-MM-dd")
      );
      setAvailability(data);
    } catch (error) {
      console.error("Erro ao buscar disponibilidade:", error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("info");
  };

  const handleInfoSubmit = () => {
    if (studentData.name && studentData.email) {
      setStep("payment");
    }
  };

  const handlePaymentValidation = (isValid: boolean, data?: any) => {
    setIsPaymentValid(isValid);
    setPaymentData(data || null);
  };

  const handleBooking = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !studentData.name ||
      !studentData.email ||
      !isPaymentValid
    ) {
      setError("Preencha todos os campos e os dados de pagamento corretamente");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/bookings", {
        teacherId: teacher.id,
        studentName: studentData.name,
        studentEmail: studentData.email,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime,
        studentPaymentMethod,
        paymentData,
      });
      if (response.data.paymentUrl) {
        window.open(response.data.paymentUrl, "_blank");
      } else {
        setError("Erro inesperado ao processar pagamento.");
      }
    } catch (error: any) {
      setError(error?.response?.data?.error || "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = () => {
    return availability.availability.map((slot: any) => ({
      ...slot,
      time: new Date(slot.start).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        {/* Teacher Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={teacher.photo} />
                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{teacher.name}</CardTitle>
                <p className="text-gray-600">{teacher.description}</p>
                <div className="flex items-center mt-2 text-green-600 font-semibold">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {teacher.price.toFixed(2)} {teacher.currency}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        {/* Booking Steps */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Step 1: Date Selection */}
          {step === "date" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {t("publicBooking.chooseDate")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          )}
          {/* Step 2: Time Selection */}
          {step === "time" && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {t("publicBooking.chooseDate")} -{" "}
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TimeSlotGrid
                  slots={getAvailableTimeSlots()}
                  loading={loading}
                  error={error}
                  selectedTime={selectedTime}
                  onSelect={(slot) => {
                    setSelectedTime(slot.start);
                    setStep("info");
                  }}
                />
                {availability.events && availability.events.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      {t("publicBooking.eventsOfDay")}
                    </h4>
                    <div className="space-y-1">
                      {availability.events.map((event: any, index: number) => (
                        <div
                          key={index}
                          className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                        >
                          <strong>{event.title}</strong> -{" "}
                          {new Date(event.start).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(event.end).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Step 3: Student Info */}
          {step === "info" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  {t("publicBooking.yourData")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("booking.name")}</Label>
                  <Input
                    id="name"
                    value={studentData.name}
                    onChange={(e) =>
                      setStudentData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder={t("booking.namePlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("booking.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={studentData.email}
                    onChange={(e) =>
                      setStudentData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder={t("booking.emailPlaceholder")}
                  />
                </div>
                <Button onClick={handleInfoSubmit} className="w-full">
                  {t("publicBooking.continueToPayment")}
                </Button>
              </CardContent>
            </Card>
          )}
          {/* Step 4: Payment Method & Form */}
          {step === "payment" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("publicBooking.choosePayment")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    {t("publicBooking.paymentDetails")}
                  </h3>
                  <p>
                    <strong>{t("publicBooking.teacher")}</strong> {teacher.name}
                  </p>
                  <p>
                    <strong>{t("publicBooking.date")}</strong>{" "}
                    {selectedDate &&
                      format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p>
                    <strong>{t("publicBooking.time")}</strong> {selectedTime}
                  </p>
                  <p>
                    <strong>{t("publicBooking.student")}</strong>{" "}
                    {studentData.name}
                  </p>
                  <p>
                    <strong>{t("publicBooking.email")}</strong>{" "}
                    {studentData.email}
                  </p>
                  <p>
                    <strong>{t("publicBooking.value")}</strong>{" "}
                    {teacher.price.toFixed(2)} {teacher.currency}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("publicBooking.choosePayment")}
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={studentPaymentMethod === "stripe"}
                        onChange={(e) => {
                          setStudentPaymentMethod(
                            e.target.value as "stripe" | "paypal"
                          );
                          setIsPaymentValid(false);
                          setPaymentData(null);
                        }}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">
                          {t("publicBooking.creditCard")}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("publicBooking.creditCardDesc")}
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={studentPaymentMethod === "paypal"}
                        onChange={(e) => {
                          setStudentPaymentMethod(
                            e.target.value as "stripe" | "paypal"
                          );
                          setIsPaymentValid(false);
                          setPaymentData(null);
                        }}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">
                          {t("publicBooking.paypal")}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("publicBooking.paypalDesc")}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                {/* Formulário Condicional */}
                {studentPaymentMethod === "stripe" ? (
                  <CardPaymentForm
                    onValidationChange={handlePaymentValidation}
                  />
                ) : (
                  <PaypalPaymentForm
                    onValidationChange={handlePaymentValidation}
                  />
                )}
                <Button
                  onClick={handleBooking}
                  disabled={loading || !isPaymentValid}
                  className="w-full"
                >
                  {loading
                    ? t("payment.processing")
                    : `${t("payment.pay")} ${teacher.price.toFixed(2)} ${
                        teacher.currency
                      }`}
                </Button>
              </CardContent>
            </Card>
          )}
          {/* Navigation */}
          <div className="space-y-4">
            {step !== "date" && (
              <Button
                variant="outline"
                onClick={() =>
                  setStep(
                    step === "time" ? "date" : step === "info" ? "time" : "info"
                  )
                }
              >
                Voltar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
