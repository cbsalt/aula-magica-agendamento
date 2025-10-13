"use client";

import { getTeacherPublicLink } from "@/services/teacherService";
import {
  Banknote,
  CalendarCog,
  CalendarDays,
  CreditCard,
  Link2,
  Menu,
  Share2,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import useSWR from "swr";
import { Button } from "../ui/button";
import { CalendarSetup } from "./CalendarSetup";
import { FinancialPanel } from "./FinancialPanel";
import { IntegrationsSection } from "./IntegrationSection";
import { InteractiveCalendar } from "./InteractiveCalendar";
import { PaymentsSection } from "./PaymentSection";
import { ProfileSection } from "./ProfileSection";
import { PublicLinkSection } from "./PublicSection";

export function Dashboard({
  bookings,
  previewData,
  paymentConfig,
  teacherProfile,
  teacherFallback,
  initialAvailability,
}) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const zoomStatus = searchParams.get("zoom");

  const [activeTab, setActiveTab] = useState("profile");
  const [open, setOpen] = useState(false);

  const tabs = [
    { id: "profile", label: "Perfil", icon: <User size={18} /> },
    {
      id: "calendar-setup",
      label: "Disponibilidade",
      icon: <CalendarCog size={18} />,
    },
    {
      id: "calendar-view",
      label: "Calendário",
      icon: <CalendarDays size={18} />,
    },
    { id: "public-link", label: "Link Público", icon: <Share2 size={18} /> },
    { id: "integrations", label: "Integrações", icon: <Link2 size={18} /> },
    { id: "payments", label: "Pagamentos", icon: <CreditCard size={18} /> },
    // { id: "finance", label: "Financeiro", icon: <Banknote size={18} /> },
  ];

  const clearUrlParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("zoom");
    url.searchParams.delete("tab");
    window.history.replaceState({}, "", url.toString());
  };

  const {
    data: { teacher },
    mutate,
  } = useSWR("/api/teachers/me/public-link", getTeacherPublicLink, {
    fallbackData: teacherFallback,
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });

  const renderTabs = {
    profile: <ProfileSection teacherProfile={teacherProfile} />,
    ["calendar-setup"]: (
      <CalendarSetup
        teacherAvailability={previewData}
        initialAvailability={initialAvailability}
        teacherProfile={teacherProfile}
      />
    ),
    ["calendar-view"]: <InteractiveCalendar bookings={bookings} />,
    "public-link": <PublicLinkSection teacher={teacher} onUpdate={mutate} />,
    integrations: <IntegrationsSection />,
    payments: <PaymentsSection initialData={paymentConfig} />,
    finance: <FinancialPanel />,
  };

  useEffect(() => {
    if (zoomStatus === "success") {
      toast.success("Zoom conectado com sucesso", {
        position: "top-center",
      });

      clearUrlParams();
    }
  }, [zoomStatus]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const Sidebar = () => (
    <nav className="space-y-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            clearUrlParams();
            setOpen(false);
          }}
          className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
            activeTab === tab.id
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span className="mr-3">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Botão de menu no mobile */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard do Professor
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || ""}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-700">
                {session?.user?.name}
              </span>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer Mobile */}
      {open && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative bg-white w-64 h-full shadow-lg z-50 p-4">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Desktop */}
          <div className="hidden md:block w-64">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1">{renderTabs[activeTab]}</div>
        </div>
      </div>
    </div>
  );
}
