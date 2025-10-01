import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { addOneHour } from "@/utils";
import { format, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SerializedTeacher } from "../interfaces";
import AnimatedCard from "./animated-card";

interface Props {
  teacher: SerializedTeacher;
  selectedTimes: Array<{ date: string; time: string }>;
  studentData: {
    name?: string;
    email?: string;
  };
  studentPaymentMethod: "creditCard" | "paypal";
  setStudentPaymentMethod: (method: "creditCard" | "paypal") => void;
  handleBooking: () => void;
  loading: boolean;
}

export default function PaymentStep({
  teacher,
  selectedTimes,
  studentData,
  studentPaymentMethod,
  setStudentPaymentMethod,
  handleBooking,
  loading,
}: Props) {
  const { t } = useTranslation();

  const totalAmount = teacher.price * selectedTimes.length;

  return (
    <AnimatedCard>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {t("publicBooking.choosePayment")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700">
          <p>
            <strong>{t("publicBooking.teacher")}</strong> {teacher.name}
          </p>

          <div className="mt-3">
            <strong>{t("publicBooking.selectedTimes")}</strong>
            <div className="mt-2 space-y-1">
              {selectedTimes.map((timeSlot, index) => {
                const endTime = addOneHour(timeSlot.time);

                return (
                  <div
                    key={index}
                    className="flex justify-between items-center rounded-xl border p-4 mb-2 bg-white shadow-sm"
                  >
                    {/* Coluna da data + horário */}
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">
                        {format(parseISO(timeSlot.date), "dd/MM/yyyy")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">
                          {timeSlot.time}
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <span className="text-lg font-medium">{endTime}</span>
                      </div>
                    </div>

                    {/* Coluna do preço */}
                    <span className="text-lg font-semibold text-gray-700">
                      {teacher.currency} {teacher.price.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-300">
            <div className="flex justify-between items-center font-semibold">
              <span>{t("publicBooking.total")}</span>
              <span>
                {totalAmount.toFixed(2)} {teacher.currency}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t("publicBooking.lesson", { count: selectedTimes.length })} ×{" "}
              {teacher.price.toFixed(2)} {teacher.currency}
            </div>
          </div>

          <p>
            <strong>{t("publicBooking.student")}</strong> {studentData.name}
          </p>
          <p>
            <strong>{t("publicBooking.email")}</strong> {studentData.email}
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            {t("publicBooking.choosePayment")}
          </Label>
          {["creditCard", "paypal"].map((method) => (
            <label
              key={method}
              className="flex items-start gap-3 p-3 rounded-md border hover:border-primary transition cursor-pointer"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={studentPaymentMethod === method}
                onChange={() =>
                  setStudentPaymentMethod(method as "creditCard" | "paypal")
                }
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-800">
                  {t(`publicBooking.${method}`)}
                </div>
                <div className="text-sm text-gray-500">
                  {t(`publicBooking.${method}Desc`)}
                </div>
              </div>
            </label>
          ))}
        </div>

        <Button
          onClick={handleBooking}
          disabled={loading || selectedTimes.length === 0}
          className="w-full"
        >
          {loading
            ? t("payment.processing")
            : `${t("payment.pay")} ${totalAmount.toFixed(2)} ${
                teacher.currency
              }`}
        </Button>
      </CardContent>
    </AnimatedCard>
  );
}
