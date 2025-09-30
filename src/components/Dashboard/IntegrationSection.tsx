"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { toast } from "react-hot-toast";
import { disconnectZoom, getZoomOAuthUrl } from "@/services/zoomService";
import { useSession } from "next-auth/react";
import { Video } from "lucide-react";

export const IntegrationsSection = () => {
  const { data: session } = useSession();

  const [zoomConnected, setZoomConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (session?.user?.zoomConnected !== undefined) {
      setZoomConnected(session.user.zoomConnected);
    }
  }, [session?.user?.zoomConnected]);

  const handleZoomOAuthConnect = () => {
    try {
      setIsConnecting(true);
      const url = getZoomOAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar conexão com o Zoom", {
        position: "top-center",
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectZoom();
      setZoomConnected(false);

      toast.success("Zoom desconectado com sucesso", {
        position: "top-center",
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao desconectar do Zoom", {
        position: "top-center",
      });
    }
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
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">
                  <Video size={32} />
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
                {isConnecting ? "Conectando..." : "Conectar conta Zoom"}
              </Button>
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Caso não tenha uma conta Zoom, o link de aula será gerado
                  automaticamente para o Google Meet.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
