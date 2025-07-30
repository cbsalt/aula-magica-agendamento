import { fetchTeacherAvailability } from "@/services/teacherService";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useTeacherData, weekDays } from "@/hooks/useTeacherData";

export const CalendarSection = () => {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState({ availability: [] });
  const [previewError, setPreviewError] = useState<string | null>(null);

  const {
    workSchedule,
    setWorkSchedule,
    isConnected,
    setIsConnected,
    loading,
  } = useTeacherData(weekDays);

  // Função para buscar preview da semana
  const fetchPreview = async () => {
    if (!session?.user?.teacherId) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const today = new Date();
      const days: { date: string; label: string }[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        days.push({
          date: d.toISOString().slice(0, 10),
          label:
            i === 0
              ? "Hoje"
              : i === 1
              ? "Amanhã"
              : d.toLocaleDateString("pt-BR", { weekday: "long" }),
        });
      }

      const results = await fetchTeacherAvailability(session.user.teacherId);

      setPreviewData(results);
    } catch (err) {
      setPreviewError("Erro ao buscar preview de disponibilidade.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Atualiza preview ao carregar ou ao salvar horários
  useEffect(() => {
    if (isConnected && session?.user?.teacherId) {
      fetchPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const handleChange = (
    idx: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setWorkSchedule((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const toSave = workSchedule.filter(
      (item) => item.startTime && item.endTime
    );
    const res = await fetch("/api/teachers/me/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSave),
    });
    if (res.ok) {
      setMessage("Horário salvo com sucesso!");
    } else {
      setMessage("Erro ao salvar horário.");
    }
    setSaving(false);
  };

  const connectCalendar = () => {
    signIn("google"); // Usa o fluxo seguro do NextAuth
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Disponibilidade semanal
          </h2>
          <p className="text-gray-700 mb-4">
            Defina aqui os dias e horários em que você normalmente está
            disponível para dar aulas. Os eventos da sua agenda conectada
            (Google Calendar) serão usados para bloquear horários ocupados
            automaticamente.
          </p>
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <form className="space-y-2">
              {weekDays.map((day, idx) => (
                <div key={day.value} className="flex items-center gap-2">
                  <label className="w-24 text-gray-700">{day.label}</label>
                  <input
                    type="time"
                    value={workSchedule[idx].startTime}
                    onChange={(e) =>
                      handleChange(idx, "startTime", e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  />
                  <span>às</span>
                  <input
                    type="time"
                    value={workSchedule[idx].endTime}
                    onChange={(e) =>
                      handleChange(idx, "endTime", e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  />
                </div>
              ))}
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-4"
              >
                {saving ? "Salvando..." : "Salvar horários"}
              </Button>
              {message && (
                <div className="text-sm mt-2 text-blue-700">{message}</div>
              )}
            </form>
          )}
        </div>
        {/* Preview de disponibilidade real */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">
            Preview de Disponibilidade Para a Semana
          </h3>
          {previewLoading ? (
            <div>Carregando preview...</div>
          ) : previewError ? (
            <div className="text-red-600">{previewError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewData?.availability?.map((day) => (
                <div key={day.date} className="bg-blue-50 rounded p-4">
                  <div className="font-medium text-blue-800 mb-1">
                    {day.label} ({day.date.split("-").reverse().join("/")})
                  </div>
                  {day.slots && day.slots.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {day.slots.map((slot: any) => (
                        <span
                          key={slot.start}
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            slot.available
                              ? "bg-green-200 text-green-900"
                              : "bg-gray-200 text-gray-500 line-through"
                          }`}
                        >
                          {new Date(slot.start).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(slot.end).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm mt-2">
                      Sem horários disponíveis
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          {isConnected ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-5xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Calendário Conectado!
              </h3>
              <p className="text-gray-600 mb-4">
                Sua agenda está sincronizada e os horários disponíveis são
                atualizados automaticamente.
              </p>
              <Button variant="outline" onClick={() => setIsConnected(false)}>
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conectar Google Calendar
              </h3>
              <p className="text-gray-600 mb-6">
                Conecte sua agenda para que os alunos vejam apenas seus horários
                realmente disponíveis.
              </p>
              <Button onClick={connectCalendar}>Conectar Agenda</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
