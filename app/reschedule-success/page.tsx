"use client";

import { CheckCircle2 } from "lucide-react";

export default function RescheduleSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <CheckCircle2 className="text-green-600 w-20 h-20 mb-6" />
      <h1 className="text-2xl font-bold text-green-800 mb-4">
        Horário(s) reagendado(s) com sucesso!
      </h1>
      <p className="text-green-700 text-center mb-8">
        Seus novos horários foram salvos com sucesso. Você pode fechar esta
        tela.
      </p>
    </div>
  );
}
