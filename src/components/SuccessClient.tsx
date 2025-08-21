// components/SuccessClient.tsx
"use client";

import { CalendarClock, CheckCircle2, Mail, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

interface SuccessClientProps {
  metadata: {
    studentName: string;
    date: string;
    time: string;
  };
}

export default function SuccessClient({
  metadata,
}: {
  metadata?: SuccessClientProps["metadata"];
}) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        {metadata ? (
          <>
            <div className="flex items-center space-x-3 text-green-600 mb-6">
              <CheckCircle2 className="w-8 h-8" />
              <h1 className="text-2xl font-bold">
                {t("payment.success.payment.confirmed")}
              </h1>
            </div>
            <p className="text-gray-700 mb-6">
              {t("payment.success.payment.thanks")}{" "}
              <span className="font-semibold">{metadata?.studentName}</span>!
            </p>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <span>
                  {t("payment.success.student")}:{" "}
                  <strong>{metadata?.studentName}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-5 h-5 text-purple-500" />
                <span>
                  {t("payment.success.date")}: <strong>{metadata?.date}</strong>{" "}
                  – {t("payment.success.time")}:{" "}
                  <strong>{metadata?.time}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-red-500" />
                <span>{t("payment.success.email.sent")}</span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {t("payment.success.email.info")}
              </p>
            </div>{" "}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-6">
              {t("payment.success.payment.received")}
            </h1>
            <p className="text-gray-700">
              {t("payment.success.paypal.confirmation")}
            </p>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {t("payment.success.email.info")}
              </p>
            </div>{" "}
          </>
        )}
      </div>
    </main>
  );
}
