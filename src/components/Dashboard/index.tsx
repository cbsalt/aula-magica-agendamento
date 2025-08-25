"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import toast, { Toaster } from "react-hot-toast";
import { ProfileSection } from "./ProfileSection";
import { CalendarSection } from "./CalendarSection";
import { IntegrationsSection } from "./IntegrationSection";
import { PaymentsSection } from "./PaymentSection";
import { PublicLinkSection } from "./PublicSection";
import { useSearchParams } from "next/navigation";
import { User, CalendarDays, Link2, CreditCard, Share2 } from "lucide-react";
import useSWR from "swr";
import { getTeacherPublicLink } from "@/services/teacherService";

export default function Dashboard({ teacherFallback }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const zoomStatus = searchParams.get("zoom");

  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Perfil", icon: <User size={18} /> },
    { id: "calendar", label: "Calendário", icon: <CalendarDays size={18} /> },
    { id: "integrations", label: "Integrações", icon: <Link2 size={18} /> },
    { id: "payments", label: "Pagamentos", icon: <CreditCard size={18} /> },
    { id: "public-link", label: "Link Público", icon: <Share2 size={18} /> },
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
  });

  const renderTabs = {
    profile: <ProfileSection />,
    calendar: <CalendarSection />,
    integrations: <IntegrationsSection />,
    payments: <PaymentsSection initialData={{}} />,
    "public-link": <PublicLinkSection teacher={teacher} onUpdate={mutate} />,
  };

  useEffect(() => {
    if (zoomStatus === "success") {
      toast.success("Zoom conectado com sucesso");

      clearUrlParams();
    }
  }, [zoomStatus]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard do Professor
            </h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearUrlParams();
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
          </div>

          {/* Main Content */}
          <div className="flex-1">{renderTabs[activeTab]}</div>
        </div>
      </div>
    </div>
  );
}
