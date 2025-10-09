"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse, parseISO } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Info } from "lucide-react";

import { getBrasiliaTimeLabel } from "@/utils";
import {
  DateSelectionStep,
  PaymentStep,
  StudentInfoFormData,
  StudentInfoStep,
  TimeSelectionStep,
} from "./Steps";

import { TeacherWorkSchedule } from "@prisma/client";
import {
  LanguageSelector,
  SelectedTimesDrawer,
  ModalRescheduleConfirmation,
  Header,
  Footer,
  ProgressBar,
} from "@/components";
import { Button } from "@/components/ui";

import { SelectedTimesProvider } from "@/contexts/SelectedTimesContext";
import { useSelectedTimes } from "@/hooks/useSelectedTimes";
import { PaymentMethod } from "@/utils/enums";

import { fetchTeacherAvailability } from "@/services/teacherService";
import { updateScheduledBookings } from "@/services/bookingService";
import { createBooking } from "@/services/paymentService";

import { SerializedTeacher } from "./interfaces";

interface Props {
  teacher: SerializedTeacher;
  workScheduleTeacher?: Partial<TeacherWorkSchedule>[];
  scheduled?: Array<{
    id: string;
    batchId: string | null;
    studentName: string;
    studentEmail: string;
    date: string;
    time: string;
    teacherId: string;
    isEdited?: boolean;
  }>;
}

interface ReschedulePayload {
  timeSlots: { date: string; time: string }[];
  bookingId?: string;
  batchId?: string;
}

function PublicBookingPageContent({
  teacher,
  scheduled,
  workScheduleTeacher,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedTimes, addTimeSlot, removeTimeSlot, isTimeSlotSelected } =
    useSelectedTimes();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    scheduled?.[0]?.date
      ? parse(scheduled[0].date, "yyyy-MM-dd", new Date())
      : undefined
  );
  const [teacherAvailability, setTeacherAvailability] = useState([] as []);
  const [studentData, setStudentData] = useState<{
    name?: string;
    email?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"dateTime" | "info" | "payment">("dateTime");
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [scheduledBookings, setScheduledBookings] = useState(scheduled);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [slotToUpdate, setSlotToUpdate] = useState([]);
  const [pendingSlot, setPendingSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);

  const steps = ["dateTime", "info", "payment"];

  const [studentPaymentMethod, setStudentPaymentMethod] =
    useState<PaymentMethod>(PaymentMethod.CREDITCARD);

  const searchParams = useSearchParams();
  const rescheduleParams = useMemo(() => {
    const bookingId = searchParams?.get("bookingId") || undefined;
    const batchId = searchParams?.get("batchId") || undefined;
    return { bookingId, batchId };
  }, [searchParams]);

  const isRescheduleMode = !!(
    rescheduleParams.bookingId || rescheduleParams.batchId
  );

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
            slots: (day.slots || []).filter((slot) => slot.available),
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
    if (step === "dateTime" && selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [step, selectedDate, fetchAvailability]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const onSubmit = (data: StudentInfoFormData) => {
    setStudentData(data);
    setStep("payment");
  };

  const handleBooking = async () => {
    setLoading(true);

    try {
      let payload;

      if (selectedTimes.length > 1) {
        payload = {
          teacherId: teacher.id,
          studentName: studentData.name,
          studentEmail: studentData.email,
          timeSlots: selectedTimes.map((timeSlot) => ({
            date: timeSlot.date,
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
        toast.error("Erro inesperado ao redirecionar para o pagamento.", {
          position: "top-center",
        });
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.error;

      if (error?.response?.status === 409) {
        return toast.error(errorMessage, {
          position: "top-center",
        });
      }

      toast.error(errorMessage || "Erro ao criar pagamento", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceScheduledSlot = (slot: { date: string; time: string }) => {
    const alreadySelected = selectedTimes.some(
      (s) => s.date === slot.date && s.time === slot.time
    );

    const alreadyInScheduled = scheduledBookings.some(
      (s) =>
        s.date === slot.date &&
        s.time === slot.time &&
        !slotToUpdate.some((u) => u.id === s.id)
    );

    if (alreadySelected || alreadyInScheduled) {
      return toast(t(`publicBooking.reschedule.alreadySelected`), {
        icon: <Info />,
        position: "top-center",
      });
    }

    const replacedSlot = {
      ...slot,
      id: slotToUpdate[0].id,
    };

    addTimeSlot(replacedSlot, true);

    const updatedSlots = slotToUpdate.map((item) => ({
      ...item,
      date: slot.date,
      time: slot.time,
      isEdited: true,
    }));

    const newScheduledBookings = scheduledBookings.filter(
      (item) => !slotToUpdate.some((slot) => slot.id === item.id)
    );

    setScheduledBookings([...newScheduledBookings, ...updatedSlots]);
    toast.success(t("publicBooking.reschedule.success"), {
      duration: 5000,
      position: "top-center",
    });
  };

  const handleScheduledSlot = (slot: { date: string; time: string }) => {
    if (isTimeSlotSelected(slot)) {
      removeTimeSlot(slot);
      return;
    }

    addTimeSlot(slot);
  };

  const handleConfirmReschedule = async () => {
    setLoading(true);
    setIsDrawerOpen(false);

    const editedSlots = scheduledBookings.filter((slot) => slot.isEdited);

    const payload: ReschedulePayload = {
      timeSlots: editedSlots.map((timeSlot) => ({
        id: timeSlot.id,
        date: timeSlot.date,
        time: timeSlot.time,
      })),
      bookingId: rescheduleParams.bookingId,
      batchId: rescheduleParams.batchId,
    };

    try {
      await toast.promise(
        updateScheduledBookings(payload),
        {
          loading: t("publicBooking.reschedule.toast.loading"),
          success: (
            <b>
              {t("publicBooking.reschedule.toast.success", {
                count: editedSlots.length,
              })}
            </b>
          ),
          error: <b>{t("publicBooking.reschedule.toast.error")}</b>,
        },
        {
          duration: 5000,
          position: "top-center",
        }
      );

      router.push("/reschedule-success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <Header teacher={teacher} isRescheduleMode={isRescheduleMode} />

        {isRescheduleMode && (
          <div className="bg-purple-200 border-l-4 border-purple-400 text-purple-700 p-3 rounded mb-4 text-center">
            {!slotToUpdate.length ? (
              <>
                {t("publicBooking.reschedule.noSlotSelected.message")}{" "}
                <span
                  className="font-semibold cursor-pointer"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  {t("publicBooking.reschedule.noSlotSelected.action")}
                </span>
                .
              </>
            ) : (
              <>
                {t("publicBooking.reschedule.slotSelected.prefix")}{" "}
                <span className="font-semibold">
                  {format(parseISO(slotToUpdate[0].date), "dd/MM/yyyy")} às{" "}
                  {slotToUpdate[0].time}
                </span>
                . {t("publicBooking.reschedule.slotSelected.suffix")}
              </>
            )}
          </div>
        )}

        {!isRescheduleMode && <ProgressBar steps={steps} step={step} />}

        <div className="flex flex-col md:flex-row md:flex-wrap gap-6 justify-center">
          {step === "dateTime" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DateSelectionStep
                isRescheduleMode={isRescheduleMode}
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                workScheduleTeacher={workScheduleTeacher}
              />

              {selectedDate && (
                <TimeSelectionStep
                  selectedDate={selectedDate}
                  onChangeDate={(newDate) => {
                    setSelectedDate(newDate);
                  }}
                  teacherAvailability={teacherAvailability}
                  onHandleSlot={
                    isRescheduleMode
                      ? (slot) => {
                          setPendingSlot(slot);
                          setIsRescheduleModalOpen(true);
                        }
                      : handleScheduledSlot
                  }
                  loadingAvailability={loadingAvailability}
                  isRescheduleMode={isRescheduleMode}
                  slotToUpdate={slotToUpdate}
                />
              )}
            </div>
          )}

          {/* Step 3: Student Info */}
          {!isRescheduleMode && step === "info" && (
            <StudentInfoStep onSubmit={onSubmit} />
          )}

          {/* Step 4: Payment */}
          {!isRescheduleMode && step === "payment" && (
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
        {!isRescheduleMode && (
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
        )}
        {step === "dateTime" && (
          <div className="text-sm text-gray-500 mt-4 text-center">
            {t("publicBooking.timezone.label", {
              offset: getBrasiliaTimeLabel(),
            })}
          </div>
        )}
      </div>

      <SelectedTimesDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setIsDrawerOpen}
        isRescheduleMode={isRescheduleMode}
        teacher={teacher}
        scheduledBookings={scheduledBookings}
        slotToUpdate={slotToUpdate}
        setSlotToUpdate={setSlotToUpdate}
        onContinue={() =>
          isRescheduleMode ? setIsRescheduleModalOpen(true) : setStep("info")
        }
      />

      {isRescheduleModalOpen && (
        <ModalRescheduleConfirmation
          isLoading={loading}
          shouldReplaceSlot={!!pendingSlot}
          setIsRescheduleModalOpen={setIsRescheduleModalOpen}
          onHandleReplaceSlot={() => {
            if (pendingSlot) {
              handleReplaceScheduledSlot(pendingSlot);
              setPendingSlot(null);
            }
          }}
          onConfirm={handleConfirmReschedule}
        />
      )}
    </div>
  );
}

export function PublicBookingPage({
  teacher,
  scheduled,
  workScheduleTeacher,
}: Props) {
  return (
    <SelectedTimesProvider>
      <PublicBookingPageContent
        teacher={teacher}
        scheduled={scheduled}
        workScheduleTeacher={workScheduleTeacher}
      />

      <Footer />
    </SelectedTimesProvider>
  );
}
