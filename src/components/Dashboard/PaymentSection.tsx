"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { toast } from "react-hot-toast";

export const PaymentsSection = () => {
  const [paymentConfig, setPaymentConfig] = useState({
    receiveViaStripe: false,
    stripeAccountId: "",
    receiveViaPayPal: false,
    paypalEmail: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaymentConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const savePaymentConfig = async () => {
    if (!paymentConfig.receiveViaStripe && !paymentConfig.receiveViaPayPal) {
      toast.error("Selecione pelo menos uma forma de recebimento");
      return;
    }

    if (paymentConfig.receiveViaStripe && !paymentConfig.stripeAccountId) {
      toast.error("Informe o Stripe Account ID");
      return;
    }

    if (paymentConfig.receiveViaPayPal && !paymentConfig.paypalEmail) {
      toast.error("Informe o e-mail do PayPal");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/teachers/me/payment-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...paymentConfig,
          isActive: true,
        }),
      });

      if (response.ok) {
        toast.success("Configuração de pagamento salva com sucesso!");
      } else {
        const error = await response.json();
        toast.error(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">
          Configuração de Recebimento
        </h2>
        <p className="text-gray-600 mb-6">
          Configure como deseja receber os pagamentos dos alunos. A plataforma
          processará os pagamentos e repassará os valores para você
          automaticamente.
        </p>

        <div className="space-y-6">
          {/* Stripe Connect */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="receiveViaStripe"
                checked={paymentConfig.receiveViaStripe}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium">Receber via Stripe Connect</h3>
                <p className="text-sm text-gray-600">
                  Receba diretamente na sua conta Stripe
                </p>
              </div>
            </div>

            {paymentConfig.receiveViaStripe && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Account ID
                </label>
                <input
                  name="stripeAccountId"
                  value={paymentConfig.stripeAccountId}
                  onChange={handleInputChange}
                  placeholder="acct_xxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Encontre seu Account ID no dashboard do Stripe
                </p>
              </div>
            )}
          </div>

          {/* PayPal */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="receiveViaPayPal"
                checked={paymentConfig.receiveViaPayPal}
                onChange={handleInputChange}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium">Receber via PayPal</h3>
                <p className="text-sm text-gray-600">
                  Receba diretamente na sua conta PayPal
                </p>
              </div>
            </div>

            {paymentConfig.receiveViaPayPal && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail do PayPal
                </label>
                <input
                  name="paypalEmail"
                  type="email"
                  value={paymentConfig.paypalEmail}
                  onChange={handleInputChange}
                  placeholder="seu@paypal.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  E-mail da conta PayPal onde receberá os pagamentos
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Como funciona?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Os alunos escolhem como querem pagar (cartão ou PayPal)</li>
              <li>• A plataforma processa o pagamento</li>
              <li>• O valor é repassado automaticamente para você</li>
              <li>• Você pode configurar múltiplas formas de recebimento</li>
            </ul>
          </div>

          <Button
            onClick={savePaymentConfig}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Salvando..." : "Salvar Configuração"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
