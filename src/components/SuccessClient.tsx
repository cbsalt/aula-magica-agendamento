"use client";

import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components";

export function SuccessClient() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-8">
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <h1 className="text-2xl font-bold text-green-600 mb-6">
          {t("payment.success.payment.received")}
        </h1>

        <p className="text-gray-700">
          {t("payment.success.payment.confirmation")}
        </p>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {t("payment.success.email.info")}
          </p>
        </div>
      </div>
    </main>
  );
}
