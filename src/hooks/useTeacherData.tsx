import { useEffect, useState } from "react";
import {
  getTeacherAvailability,
  getTeacherProfile,
} from "@/services/teacherService";
import axios from "axios";

export const weekDays = [
  { label: "Domingo", value: 0 },
  { label: "Segunda", value: 1 },
  { label: "Terça", value: 2 },
  { label: "Quarta", value: 3 },
  { label: "Quinta", value: 4 },
  { label: "Sexta", value: 5 },
  { label: "Sábado", value: 6 },
];

const defaultSchedule = weekDays.map((day) => ({
  dayOfWeek: day.value,
  startTime: "",
  endTime: "",
}));

export function useTeacherData(weekDays: { value: number }[]) {
  const [isConnected, setIsConnected] = useState(false);
  const [workSchedule, setWorkSchedule] = useState(defaultSchedule);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        const [availability, profile] = await Promise.all([
          getTeacherAvailability(),
          getTeacherProfile(),
        ]);

        // Atualiza disponibilidade semanal
        if (Array.isArray(availability)) {
          const schedule = weekDays.map((day) => {
            const found = availability.find(
              (d: any) => d.dayOfWeek === day.value
            );
            return found
              ? {
                  dayOfWeek: day.value,
                  startTime: found.startTime,
                  endTime: found.endTime,
                }
              : { dayOfWeek: day.value, startTime: "", endTime: "" };
          });
          setWorkSchedule(schedule);
        }

        // Atualiza conexão Google
        setIsConnected(!!profile.googleAccessToken);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Erro ao buscar dados do professor:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      source.cancel("Componente desmontado");
    };
  }, [weekDays]);

  return {
    workSchedule,
    setWorkSchedule,
    isConnected,
    setIsConnected,
    loading,
  };
}
