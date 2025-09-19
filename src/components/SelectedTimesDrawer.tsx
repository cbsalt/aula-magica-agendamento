"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSelectedTimes } from "@/hooks/useSelectedTimes";
import { Teacher } from "@prisma/client";

interface Props {
  teacher: Teacher;
  onContinue: () => void;
}

export default function SelectedTimesDrawer({ teacher, onContinue }: Props) {
  const { t } = useTranslation();
  const { selectedTimes, clearSelectedTimes } = useSelectedTimes();
  const [isOpen, setIsOpen] = useState(false);

  const totalAmount = teacher.price * selectedTimes.length;

  if (selectedTimes.length === 0) return null;

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
          {selectedTimes.length}{" "}
          {selectedTimes.length === 1
            ? t("publicBooking.lesson")
            : t("publicBooking.lessons")}
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
              {t("publicBooking.selectedTimes")}
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
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {selectedTimes.map((timeSlot, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">
                            {format(timeSlot.date, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            {timeSlot.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {teacher.price.toFixed(2)} {teacher.currency}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="flex items-center">
                {t("publicBooking.total")}
              </span>
              <span className="text-primary">
                {totalAmount.toFixed(2)} {teacher.currency}
              </span>
            </div>

            <div className="text-sm text-gray-500 text-center">
              {selectedTimes.length}{" "}
              {selectedTimes.length === 1
                ? t("publicBooking.lesson")
                : t("publicBooking.lessons")}{" "}
              × {teacher.price.toFixed(2)} {teacher.currency}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={clearSelectedTimes}
                className="flex-1"
              >
                {t("publicBooking.clear")}
              </Button>
              <Button
                onClick={() => {
                  onContinue();
                  setIsOpen(false);
                }}
                className="flex-1"
              >
                {t("publicBooking.continue")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
