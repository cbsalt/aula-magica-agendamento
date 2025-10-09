import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { I18nProvider } from "@/components";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "scheduleasier - Agendamento de Aulas",
  description: "Plataforma para agendamento e pagamento de aulas particulares",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
