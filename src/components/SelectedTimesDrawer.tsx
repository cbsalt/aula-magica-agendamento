"use client";

import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, X } from "lucide-react";

import { Card, CardContent, Button } from "@/components/ui";
import { TimeSlot, useSelectedTimes } from "@/hooks/useSelectedTimes";
import { SerializedTeacher } from "./interfaces";

interface Props {
  isRescheduleMode: boolean;
  teacher: SerializedTeacher;
  scheduledBookings?: { id: string; date: string; time: string }[];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  slotToUpdate;
  setSlotToUpdate;
  onContinue: () => void;
}

type ExtendedSlot = TimeSlot & { isEdited?: boolean };

export function SelectedTimesDrawer({
  isRescheduleMode,
  teacher,
  scheduledBookings = [],
  isOpen,
  setIsOpen,
  slotToUpdate,
  setSlotToUpdate,
  onContinue,
}: Props) {
  const { t } = useTranslation();
  const { selectedTimes, clearSelectedTimes } = useSelectedTimes();

  const selectedSlots: ExtendedSlot[] = isRescheduleMode
    ? scheduledBookings
    : selectedTimes;

  const totalAmount = teacher.price * selectedTimes.length;

  const hasEdition = selectedSlots.some((slot) => slot.isEdited);
  const isDisabled = isRescheduleMode && !hasEdition;

  if (!scheduledBookings.length && !selectedTimes.length) return null;

  const handleRescheduleClick = (bookingId) => {
    const updateScheduled = scheduledBookings.filter(
      (item) => item.id === bookingId
    );
    setSlotToUpdate(updateScheduled);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <Calendar className="h-5 w-5 mr-2" />
          {t("publicBooking.lesson", { count: selectedSlots.length })}
        </Button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              {isRescheduleMode
                ? t("publicBooking.reschedule.editSelectedTimes")
                : t("publicBooking.selectedTimes")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedSlots.map((timeSlot, index) => {
              const isBeingEdited = slotToUpdate.some(
                (item) => item.id === timeSlot.id
              );

              return (
                <Card
                  key={`scheduled-${index}`}
                  className={`relative border cursor-pointer hover:bg-gray-50 ${
                    isBeingEdited ? "border-green-500" : "border-gray-200"
                  }`}
                  onClick={() => {
                    if (!isRescheduleMode) return;

                    handleRescheduleClick(timeSlot.id);
                  }}
                >
                  {timeSlot.isEdited && (
                    <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {t("publicBooking.reschedule.rescheduled")}
                    </span>
                  )}
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock
                          className={`h-4 w-4 ${
                            isBeingEdited ? "text-primary" : "text-gray-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {format(parseISO(timeSlot.date), "dd/MM/yyyy")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {timeSlot.time}
                          </p>
                        </div>
                      </div>
                      {!isRescheduleMode && (
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              isBeingEdited ? "text-primary" : "text-gray-500"
                            }`}
                          >
                            {teacher.price.toFixed(2)} {teacher.currency}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t p-4 space-y-3">
            {!isRescheduleMode && (
              <>
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="flex items-center">
                    {t("publicBooking.total")}
                  </span>
                  <span className="text-primary">
                    {totalAmount.toFixed(2)} {teacher.currency}
                  </span>
                </div>

                <div className="text-sm text-gray-500 text-center">
                  {t("publicBooking.lesson", { count: selectedSlots.length })} ×{" "}
                  {teacher.price.toFixed(2)} {teacher.currency}
                </div>
              </>
            )}

            <div className="flex space-x-2">
              {!isRescheduleMode && (
                <Button
                  variant="outline"
                  onClick={clearSelectedTimes}
                  className="flex-1"
                >
                  {t("publicBooking.clear")}
                </Button>
              )}
              <Button
                disabled={isDisabled}
                onClick={() => {
                  onContinue();
                  if (!isRescheduleMode) {
                    setIsOpen(false);
                  }
                }}
                className="flex-1"
              >
                {isRescheduleMode
                  ? t("publicBooking.reschedule.continue")
                  : t("publicBooking.continue")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
