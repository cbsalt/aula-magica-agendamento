"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";
import {
  CalendarClock,
  CreditCard,
  Video,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <CalendarClock className="w-10 h-10 text-blue-600" />,
      title: t("landing.smartBooking"),
      description: t("landing.smartBookingDesc"),
    },
    {
      icon: <CreditCard className="w-10 h-10 text-green-600" />,
      title: t("landing.autoPayments"),
      description: t("landing.autoPaymentsDesc"),
    },
    {
      icon: <Video className="w-10 h-10 text-purple-600" />,
      title: t("landing.onlineLessons"),
      description: t("landing.onlineLessonsDesc"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700 mb-6">
            <CheckCircle className="w-4 h-4 mr-2" />
            {t("landing.trustedByTeachers")}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t("landing.title")}
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {t("landing.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow"
              >
                {t("landing.startAsTeacher")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
            >
              {t("landing.learnMore")}
            </Button>
          </div>

          {/* Stats preview */}
          <div className="flex justify-center gap-8 mt-12 text-sm text-gray-500">
            <div>{t("landing.statsTeachers")}</div>
            <div>•</div>
            <div>{t("landing.statsLessons")}</div>
            <div>•</div>
            <div>{t("landing.statsSatisfaction")}</div>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("landing.featureSectionTitle")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("landing.featureSectionSubtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100 group"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t("landing.ctaTitle")}</h2>
          <p className="text-blue-100 mb-8 text-lg">
            {t("landing.ctaSubtitle")}
          </p>
          <Link href="/auth/signin">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
            >
              {t("landing.createAccount")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
