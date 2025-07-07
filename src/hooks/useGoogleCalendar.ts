
import { useState, useEffect } from 'react';

interface CalendarEvent {
  start: string;
  end: string;
}

interface UseGoogleCalendarProps {
  selectedDate?: Date;
}

export const useGoogleCalendar = ({ selectedDate }: UseGoogleCalendarProps) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock função para simular integração com Google Calendar
  const fetchAvailableTimes = async (date: Date): Promise<string[]> => {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock de eventos existentes no calendário
    const mockEvents: CalendarEvent[] = [
      { start: '10:00', end: '11:00' },
      { start: '14:00', end: '15:00' }
    ];
    
    // Horários possíveis (9h às 18h)
    const allTimes = [
      '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
    
    // Remove horários ocupados
    const availableTimes = allTimes.filter(time => 
      !mockEvents.some(event => event.start === time)
    );
    
    return availableTimes;
  };

  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchAvailableTimes(selectedDate)
      .then(setAvailableTimes)
      .catch(err => {
        setError(err.message);
        setAvailableTimes([]);
      })
      .finally(() => setIsLoading(false));
  }, [selectedDate]);

  return {
    availableTimes,
    isLoading,
    error,
    refetch: () => {
      if (selectedDate) {
        setIsLoading(true);
        fetchAvailableTimes(selectedDate)
          .then(setAvailableTimes)
          .catch(err => setError(err.message))
          .finally(() => setIsLoading(false));
      }
    }
  };
};
