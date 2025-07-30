"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { toast } from "react-hot-toast";
import { getZoomOAuthUrl } from "@/services/zoomService";

export const IntegrationsSection = () => {
  const [zoomConnected, setZoomConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleZoomOAuthConnect = () => {
    try {
      setIsConnecting(true);
      const url = getZoomOAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar conexão com o Zoom");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setZoomConnected(false);
    toast("Zoom desconectado");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Integração com Zoom
          </h2>

          {zoomConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">
                  🎥
                </div>
                <div>
                  <p className="font-medium text-gray-900">Zoom conectado</p>
                  <p className="text-sm text-gray-600">
                    As aulas serão geradas automaticamente com link do Zoom.
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-start space-y-4">
              <p className="text-sm text-gray-700">
                Conecte sua conta Zoom para gerar links automáticos de aula.
              </p>
              <Button
                onClick={handleZoomOAuthConnect}
                className="w-full sm:w-auto"
                disabled={isConnecting}
              >
                {isConnecting ? "Conectando..." : "Conectar com Zoom"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
