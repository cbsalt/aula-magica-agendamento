"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Mail,
  RefreshCw,
  User,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

import { getTeacherBookings, type Booking } from "@/services/financialService";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../ui";

interface CalendarDay {
  date: Date;
  bookings: Booking[];
}

export const InteractiveCalendar = ({ bookings }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetcher = async () => {
    const data = await getTeacherBookings("confirmed", 100);
    return data;
  };

  const { data: bookingsData, mutate: mutateBookings } = useSWR(
    "teacher-bookings-calendar",
    fetcher,
    {
      fallbackData: bookings,
    }
  );

  const firstDayOfMonth = startOfMonth(currentMonth);
  const emptySlotsCount = getDay(firstDayOfMonth);

  const emptySlots = Array.from({ length: emptySlotsCount });

  const defaultCurrency = bookingsData?.bookings?.[0]?.currency || "BRL";

  const formatCurrency = (
    amount: number,
    currency: string = defaultCurrency
  ) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Agrupar bookings por data
  const bookingsByDate = useMemo(() => {
    const bookings = bookingsData?.bookings || [];

    const grouped: { [key: string]: Booking[] } = {};
    bookings.forEach((booking) => {
      const dateKey = booking.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    return grouped;
  }, [bookingsData]);

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => ({
      date: day,
      bookings: bookingsByDate[format(day, "yyyy-MM-dd")] || [],
    }));
  }, [currentMonth, bookingsByDate]);

  // Navegar entre meses
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
    );
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
    );
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);

  // Selecionar data
  const handleDateSelect = useCallback((day: CalendarDay) => {
    setSelectedDate(day.date);
  }, []);

  // Obter aulas do dia selecionado
  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return bookingsByDate[dateKey] || [];
  }, [selectedDate, bookingsByDate]);

  // Obter estatísticas do mês
  const monthStats = useMemo(() => {
    const totalBookings = calendarDays.reduce(
      (sum, day) => sum + day.bookings.length,
      0
    );
    const totalRevenue = calendarDays.reduce((sum, day) => {
      return (
        sum +
        day.bookings.reduce((daySum, booking) => daySum + booking.amount, 0)
      );
    }, 0);

    return {
      totalBookings,
      totalRevenue,
      averagePerDay: totalBookings > 0 ? totalRevenue / totalBookings : 0,
    };
  }, [calendarDays]);

  if (!bookingsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando calendário...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              Calendário de Aulas
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutateBookings()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estatísticas do Mês */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total de Aulas
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {monthStats.totalBookings}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Receita Total
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(monthStats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Média por Aula
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(monthStats.averagePerDay)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Navegação */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptySlots.map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((day, index) => {
              const isCurrentDay = isToday(day.date);
              const isSelected =
                selectedDate && isSameDay(day.date, selectedDate);
              const hasBookings = day.bookings.length > 0;

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  className={`
                    p-2 h-16 text-sm rounded-lg border transition-colors
                    ${
                      isCurrentDay
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : isSelected
                        ? "bg-blue-200 border-blue-400 text-blue-900"
                        : hasBookings
                        ? "bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{format(day.date, "d")}</span>
                    {hasBookings && (
                      <div className="flex items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="ml-1 text-xs">
                          {day.bookings.length}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Dia Selecionado */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              Aulas do dia{" "}
              {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayBookings.length > 0 ? (
              <div className="space-y-4">
                {selectedDayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {booking.studentName}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-1" />
                            {booking.studentEmail}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {booking.time}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(booking.amount, booking.currency)}
                            </span>
                            {booking.meetLink && (
                              <a
                                href={booking.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Link da Aula
                              </a>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Criado em {formatDate(booking.createdAt)}
                          </div>
                        </div>
                        {booking.notes && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-700">
                            <strong>Observações:</strong> {booking.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma aula agendada para este dia</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dica */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-gray-600">
              Clique em um dia do calendário para ver as aulas agendadas. Dias
              com aulas são destacados em verde.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
