import { useSession } from "next-auth/react";
import useSWR from "swr";

import { fetchTeacherAvailability } from "@/services/teacherService";
import { Availability } from "../Partials";
import { Card, CardContent } from "../ui";

const WEEKS_TO_SHOW = 1;

export const CalendarView = ({ teacherAvailability, teacherProfile }) => {
  const { data: session } = useSession();

  const teacherId = session?.user?.teacherId;
  const shouldFetch = teacherProfile.googleCalendarConnected && !!teacherId;

  const fetcher = async () => {
    const data = await fetchTeacherAvailability(teacherId, WEEKS_TO_SHOW);
    return data.availability;
  };

  const { data: previewData, error } = useSWR(
    shouldFetch ? ["teacherAvailability", teacherId] : null,
    fetcher,
    {
      fallbackData: teacherAvailability.availability,
    }
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        <div>
          {error && (
            <div className="text-red-600">Erro ao buscar disponibilidade.</div>
          )}

          {previewData?.length ? (
            <>
              <h3 className="text-lg font-semibold mb-4 text-blue-900">
                Sua disponibilidade para a próxima semana
              </h3>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previewData.map((day) => (
                    <Availability day={day} key={day.date} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500">Nenhum horário disponível.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
