"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

import { Card, CardContent, Button, CardTitle, CardHeader } from "../ui";
import { generatePublicLink } from "@/services/teacherService";

export const PublicLinkSection = ({ teacher, onUpdate }) => {
  const initialPublicLink = teacher?.publicLink;

  const [price, setPrice] = useState(teacher?.price || 150);
  const [currency, setCurrency] = useState(teacher?.currency || "BRL");
  const [publicUrl, setPublicUrl] = useState(initialPublicLink || "");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePublicLink = async () => {
    setIsGenerating(true);
    try {
      const { publicUrl } = await generatePublicLink(price, currency);

      setPublicUrl(publicUrl);
      toast.success("Link público gerado com sucesso!", {
        position: "top-center",
      });

      onUpdate();
    } catch (error) {
      console.error("Erro ao gerar link:", error);
      toast.error(error.message || "Erro ao gerar link público", {
        position: "top-center",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado para a área de transferência!", {
      position: "top-center",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">Gerar Link Público</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Aula
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Sobre os Pagamentos
            </h4>
            <p className="text-sm text-blue-700">
              Os alunos poderão escolher como querem pagar (cartão de crédito ou
              PayPal). A plataforma processará o pagamento e repassará o valor
              para você conforme sua configuração de recebimento.
            </p>
          </div>

          <Button
            onClick={handleGeneratePublicLink}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? "Gerando..." : "Gerar Link Público"}
          </Button>

          {publicUrl && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">
                Link Público Ativo!
              </h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-green-300 rounded-md bg-white text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Compartilhe com seus alunos para que eles possam agendar aulas
                diretamente.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
