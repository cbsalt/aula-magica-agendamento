"use client";

import { AlertTriangle } from "lucide-react";

export default function NoBookingsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
      <AlertTriangle className="text-yellow-600 w-20 h-20 mb-6" />
      <h1 className="text-2xl font-bold text-yellow-800 mb-4">
        Nenhum horário disponível
      </h1>
      <p className="text-yellow-700 text-center mb-8">
        No momento, você não tem horários disponíveis para reagendamento. É
        possível que os horários anteriores já tenham expirado. Entre em contato
        com o professor para agendar novos horários.
      </p>
    </div>
  );
}
