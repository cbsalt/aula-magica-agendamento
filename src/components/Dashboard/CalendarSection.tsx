import { useTeacherData } from "@/hooks/useTeacherData";
import {
  fetchTeacherAvailability,
  saveTeacherAvailability,
} from "@/services/teacherService";
import { endOfWeek, startOfDay } from "date-fns";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Availability } from "../Partials/Availability";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { TimePicker } from "../Partials/TimePicker";

export const CalendarSection = () => {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState({ availability: [] });
  const [previewError, setPreviewError] = useState<string | null>(null);

  const { workSchedule, setWorkSchedule, isConnected, loading, weekDays } =
    useTeacherData();
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

    try {
      const toSave = workSchedule
        .map((ws) => {
          if (!ws.startTime || !ws.endTime) return null;

          return {
            dayOfWeek: ws.dayOfWeek,
            startTime: ws.startTime,
            endTime: ws.endTime,
            startInterval: ws.startInterval || null,
            endInterval: ws.endInterval || null,
          };
        })
        .filter(Boolean);

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
            Escolha os dias e horários em que você costuma estar disponível para
            dar aulas. Os compromissos da sua agenda conectada (Google Calendar)
            serão usados para bloquear automaticamente os horários já ocupados.
          </p>

          {loading ? (
            <div className="rounded-lg w-full flex flex-row align-items-center justify-content-center gap-4">
              <div className="h-16 bg-gray-200 rounded w-full mb-2 animate-pulse" />
              <div className="h-16 bg-gray-200 rounded w-full mb-2 animate-pulse" />
              <div className="h-16 bg-gray-200 rounded w-full mb-2 animate-pulse" />
            </div>
          ) : (
            <form className="space-y-4 md:space-y-0 md:grid sm:grid lg:grid gap-4">
              {weekDays.map((day, idx) => {
                const item = workSchedule.find(
                  (w) => w.dayOfWeek === day.value
                );

                return (
                  <Card
                    key={idx}
                    className="p-4 shadow-sm border border-gray-200 rounded-xl flex flex-col"
                  >
                    <TimePicker
                      variant="work"
                      idx={idx}
                      label={day.label}
                      startTime={item?.startTime ?? ""}
                      endTime={item?.endTime ?? ""}
                      setData={setWorkSchedule}
                    />

                    {/* Intervalo */}
                    <TimePicker
                      variant="interval"
                      idx={idx}
                      label="Intervalo"
                      startTime={item?.startInterval ?? ""}
                      endTime={item?.endInterval ?? ""}
                      setData={setWorkSchedule}
                    />
                  </Card>
                );
              })}

              <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || isSaveDisabled}
                  className="w-full md:w-auto"
                >
                  {saving ? "Salvando..." : "Salvar horários"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            Preview da Semana
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
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previewData?.availability?.map((day) => (
                  <Availability day={day} key={day.date} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-red-600">{previewError}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
