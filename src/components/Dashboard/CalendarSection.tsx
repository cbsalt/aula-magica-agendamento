import { endOfWeek, startOfDay } from "date-fns";
import { Calendar, CircleCheck } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useTeacherData } from "@/hooks/useTeacherData";
import {
  fetchTeacherAvailability,
  saveTeacherAvailability,
} from "@/services/teacherService";
import { Availability } from "../Partials/Availability";
import { Weekday } from "../Partials/Weekday";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export const CalendarSection = () => {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState({ availability: [] });
  const [previewError, setPreviewError] = useState<string | null>(null);

  const {
    workSchedule,
    setWorkSchedule,
    isConnected,
    setIsConnected,
    loading,
    weekDays,
  } = useTeacherData();

  const filterCurrentWeek = (arr) => {
    const today = startOfDay(new Date());
    const saturday = endOfWeek(today, { weekStartsOn: 0 });
    const endOfSaturday = new Date(saturday.setHours(23, 59, 59, 999));

    return arr.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= today && itemDate <= endOfSaturday;
    });
  };

  useEffect(() => {
    if (!isConnected || !session?.user?.teacherId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const results = await fetchTeacherAvailability(
          session.user.teacherId,
          signal
        );

        const filteredResults = filterCurrentWeek(results.availability);

        setPreviewData({ availability: filteredResults });
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          console.log("Requisição cancelada");
        } else {
          setPreviewError("Erro ao buscar preview de disponibilidade.");
        }
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();

    return () => {
      controller.abort();
    };
  }, [isConnected, session?.user?.teacherId]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    const toSave = workSchedule.filter(
      (item) => item.startTime && item.endTime
    );

    try {
      await saveTeacherAvailability(toSave);

      const results = await fetchTeacherAvailability(session.user.teacherId);
      const filteredResults = filterCurrentWeek(results.availability);
      setPreviewData({ availability: filteredResults });

      toast.success("Horários salvos com sucesso!", {
        position: "top-center",
      });
    } catch (err) {
      toast.error("Erro ao salvar horários.", {
        position: "top-center",
      });
    } finally {
      setSaving(false);
    }
  }, [saving, workSchedule, session?.user?.teacherId]);

  const connectCalendar = () => {
    signIn("google"); // Usa o fluxo seguro do NextAuth
  };

  const isSaveDisabled = workSchedule.some(
    (ws) => (ws.startTime || ws.endTime) && (!ws.startTime || !ws.endTime)
  );

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
            <div className="rounded-lg w-1/2 flex flex-row align-items-center justify-content-center gap-4">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
            </div>
          ) : (
            <form className="space-y-2">
              {weekDays.map((day, idx) => (
                <Weekday
                  day={day}
                  idx={idx}
                  key={idx}
                  workSchedule={workSchedule}
                  setWorkSchedule={setWorkSchedule}
                />
              ))}

              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || isSaveDisabled}
                className="mt-4"
              >
                {saving ? "Salvando..." : "Salvar horários"}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">
            Preview de Disponibilidade Para a Semana
          </h3>

          {previewLoading && (
            <div className="rounded-lg w-full sm:w-1/2 flex flex-col justify-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />

              <div className="flex flex-wrap gap-2">
                <div className="h-4 bg-gray-200 rounded flex-1 min-w-[60px] animate-pulse" />
                <div className="h-4 bg-gray-200 rounded flex-1 min-w-[60px] animate-pulse" />
                <div className="h-4 bg-gray-200 rounded flex-1 min-w-[60px] animate-pulse" />
                <div className="h-4 bg-gray-200 rounded flex-1 min-w-[60px] animate-pulse" />
              </div>
            </div>
          )}

          {!previewError ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewData?.availability?.map((day) => (
                <Availability day={day} key={day.date} />
              ))}
            </div>
          ) : (
            <div className="text-red-600">{previewError}</div>
          )}
        </div>

        <div className="space-y-4">
          {isConnected ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-5xl mb-4 justify-items-center">
                <CircleCheck size={48} />
              </div>
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
              <div className="flex justify-center mb-4">
                <Calendar className="text-gray-400 w-12 h-12" />
              </div>
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
