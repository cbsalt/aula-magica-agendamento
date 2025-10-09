"use client";

import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-10 max-w-md mx-auto">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Algo deu errado
      </h1>
      <p className="text-gray-600 mb-4">{message}</p>
      <p className="text-sm text-gray-500">
        Se você precisar de ajuda, envie um e-mail para{" "}
        <a
          href="mailto:suporte@seudominio.com"
          className="text-blue-600 underline hover:text-blue-800"
        >
          suporte@seudominio.com
        </a>
      </p>
    </div>
  );
}
