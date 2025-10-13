import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { I18nProvider } from "@/components";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SWRConfig } from "swr";
import "./globals.css";

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
          <AuthProvider>
            <SWRConfig
              value={{
                revalidateOnFocus: false,
                revalidateOnMount: false,
                shouldRetryOnError: false,
              }}
            >
              {children}
            </SWRConfig>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
