import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  time: string;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  loading: boolean;
  error?: string | null;
  selectedTime?: string;
  onSelect: (slot: TimeSlot) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  loading,
  error,
  selectedTime,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!slots.length) {
    return (
      <div className="col-span-2 text-center py-8 text-gray-500">
        Nenhum horário disponível nesta data
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2" role="listbox" aria-label="Horários disponíveis">
      {slots.map((slot) => (
        <Button
          key={slot.start}
          variant={slot.available ? (selectedTime === slot.start ? "default" : "outline") : "ghost"}
          onClick={() => slot.available && onSelect(slot)}
          className={`h-12 ${slot.available ? "" : "opacity-50 cursor-not-allowed"}`}
          disabled={!slot.available}
          aria-selected={selectedTime === slot.start}
          aria-disabled={!slot.available}
          tabIndex={slot.available ? 0 : -1}
          role="option"
        >
          {slot.time}
        </Button>
      ))}
    </div>
  );
}; 