import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

import { useTeacherData } from "@/hooks/useTeacherData";
import {
  fetchTeacherAvailability,
  saveTeacherAvailability,
} from "@/services/teacherService";
import { TimePicker } from "../Partials";
import { Button, Card, CardContent } from "../ui";

const WEEKS_TO_SHOW = 1;

export const CalendarSetup = ({
  teacherAvailability,
  initialAvailability,
  teacherProfile,
}) => {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  const { workSchedule, weekDays, setWorkSchedule } =
    useTeacherData(initialAvailability);

  const teacherId = session?.user?.teacherId;
  const shouldFetch = teacherProfile.googleCalendarConnected && !!teacherId;

  const fetcher = async () => {
    const data = await fetchTeacherAvailability(teacherId, WEEKS_TO_SHOW);
    return data.availability;
  };

  const shouldedFetch = shouldFetch ? ["teacherAvailability", teacherId] : null;

  const { mutate } = useSWR(shouldedFetch, fetcher, {
    fallbackData: teacherAvailability.availability,
    revalidateOnMount: false,
  });

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

      await mutate();

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
  }, [saving, workSchedule, mutate]);

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

          <>
            <form className="space-y-4 md:space-y-0 flex flex-col md:flex-row md:flex-wrap gap-4">
              {weekDays.map((day, idx) => {
                const item = workSchedule.find(
                  (w) => w.dayOfWeek === day.value
                );

                return (
                  <Card
                    key={idx}
                    className="p-2 shadow-sm border border-gray-200 rounded-xl flex flex-col"
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
            </form>
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
          </>
        </div>
      </CardContent>
    </Card>
  );
};
