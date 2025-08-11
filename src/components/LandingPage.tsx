"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import { CalendarClock, CreditCard, Video } from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {t("landing.title")}
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            {t("landing.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto shadow-md">
                {t("landing.startAsTeacher")}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto shadow-md border-gray-300"
            >
              {t("landing.learnMore")}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all text-center border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
              <CalendarClock className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Agendamento Inteligente
            </h3>
            <p className="text-gray-600 text-sm">
              Conecte seu Google Calendar e deixe os alunos verem apenas seus
              horários livres.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all text-center border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Pagamentos Automáticos
            </h3>
            <p className="text-gray-600 text-sm">
              Receba pagamentos via Stripe, PayPal ou Payoneer de forma segura e
              automática.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all text-center border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-5">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aulas Online
            </h3>
            <p className="text-gray-600 text-sm">
              Integração com Zoom para criar links de reunião automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
