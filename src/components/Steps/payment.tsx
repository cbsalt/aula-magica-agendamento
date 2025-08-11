// components/booking/PaymentStep.tsx
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AnimatedCard from "./animated-card";
import { ITeacher } from "../interfaces";

interface Props {
  teacher: ITeacher;
  selectedDate: Date;
  selectedTime: string;
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
  selectedDate,
  selectedTime,
  studentData,
  studentPaymentMethod,
  setStudentPaymentMethod,
  handleBooking,
  loading,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
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
            <p>
              <strong>{t("publicBooking.date")}</strong>{" "}
              {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <p>
              <strong>{t("publicBooking.time")}</strong> {selectedTime}
            </p>
            <p>
              <strong>{t("publicBooking.student")}</strong> {studentData.name}
            </p>
            <p>
              <strong>{t("publicBooking.email")}</strong> {studentData.email}
            </p>
            <p>
              <strong>{t("publicBooking.value")}</strong>{" "}
              {teacher.price.toFixed(2)} {teacher.currency}
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

          <Button onClick={handleBooking} disabled={loading} className="w-full">
            {loading
              ? t("payment.processing")
              : `${t("payment.pay")} ${teacher.price.toFixed(2)} ${
                  teacher.currency
                }`}
          </Button>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
