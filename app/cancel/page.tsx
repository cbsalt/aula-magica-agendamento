"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function CancelPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex justify-end mb-4">
        <LanguageSelector />
      </div>
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <XCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {t("payment.cancel.payment")}
        </h1>
        <p className="text-gray-600 mb-6">{t("payment.cancel.disclaimer")}</p>
      </div>
    </main>
  );
}
