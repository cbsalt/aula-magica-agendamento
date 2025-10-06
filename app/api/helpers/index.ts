import {
  addDays,
  addHours,
  format,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parseLocalToDate(
  dateStr,
  timeHHmm,
  timezoneLabel = "America/Sao_Paulo"
) {
  const iso = `${dateStr}T${timeHHmm}:00${timezoneLabel}`;
  return new Date(iso);
}

function filterSlotsWithMinAdvance(slots) {
  const minAdvanceDate = addHours(new Date(), 12);
  return slots.filter((slot) => slot.absoluteStart >= minAdvanceDate);
}

export function generateSlots(
  start: string,
  end: string,
  dayDate: Date,
  startInterval?: string | null,
  endInterval?: string | null
) {
  const hourFormat = "HH:mm";
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
  const slots = [];

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const baseDate = startOfDay(dayDate);
  let current = setMinutes(setHours(baseDate, startHour), startMinute);
  const zonedEndTime = setMinutes(setHours(baseDate, endHour), endMinute);

  let zonedIntervalStart: Date | null = null;
  let zonedIntervalEnd: Date | null = null;

  if (startInterval && endInterval) {
    const [iStartHour, iStartMinute] = startInterval.split(":").map(Number);
    const [iEndHour, iEndMinute] = endInterval.split(":").map(Number);
    zonedIntervalStart = setMinutes(
      setHours(baseDate, iStartHour),
      iStartMinute
    );
    zonedIntervalEnd = setMinutes(setHours(baseDate, iEndHour), iEndMinute);
  }

  while (isBefore(current, zonedEndTime)) {
    const slotStart = current;
    let slotEnd = addHours(slotStart, 1);
    if (isAfter(slotEnd, zonedEndTime)) slotEnd = zonedEndTime;

    let available = true;
    if (zonedIntervalStart && zonedIntervalEnd) {
      if (slotStart >= zonedIntervalStart && slotEnd <= zonedIntervalEnd) {
        available = false;
      }
    }

    slots.push({
      start: format(slotStart, hourFormat),
      end: format(slotEnd, hourFormat),
      available,
    });

    current = slotEnd;
  }

  return {
    label: capitalize(formatter.format(dayDate)),
    date: format(dayDate, "yyyy-MM-dd"),
    start: slots[0].start,
    end: slots[slots.length - 1].end,
    timezone: "America/Sao_Paulo",
    timezoneLabel: formatInTimeZone(new Date(), "America/Sao_Paulo", "xxx"),
    slots,
  };
}

export function initializeSlots(workSchedules, totalWeeks = 0) {
  const zonedToday = new Date();
  let allSlots = [];

  const totalDays = totalWeeks * 7 + 1;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const dayDate = addDays(zonedToday, dayOffset);
    const dayOfWeek = dayDate.getDay();

    const ws = workSchedules.find((w) => w.dayOfWeek === dayOfWeek);

    if (ws?.startTime && ws?.endTime) {
      allSlots = allSlots.concat(
        generateSlots(
          ws.startTime,
          ws.endTime,
          dayDate,
          ws?.startInterval,
          ws?.endInterval
        )
      );
    }
  }

  return allSlots;
}

export function isSlotFree(events, slot) {
  return !events.some((event) => {
    const eventStart = new Date(event.start.dateTime || event.start.date);
    const eventEnd = new Date(event.end.dateTime || event.end.date);
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    return slotStart < eventEnd && slotEnd > eventStart;
  });
}

export const freeSlots = (events, allSlots) =>
  allSlots
    .map((day) => {
      const tzLabel = day.timezoneLabel;
      const dateStr = day.date;

      const slotsWithAbsolute = (day.slots || []).map((slot) => {
        const absoluteStart = parseLocalToDate(dateStr, slot.start, tzLabel);
        const absoluteEnd = parseLocalToDate(dateStr, slot.end, tzLabel);
        return { ...slot, absoluteStart, absoluteEnd };
      });

      const availableSlots = slotsWithAbsolute.filter((slot) =>
        isSlotFree(events, {
          ...slot,
          start: slot.absoluteStart.toISOString(),
          end: slot.absoluteEnd.toISOString(),
        })
      );

      const filteredSlots = filterSlotsWithMinAdvance(availableSlots);

      if (filteredSlots.length === 0) return null;

      const normalizedSlots = filteredSlots.map((s) => ({
        start: s.start,
        end: s.end,
        available: s.available,
      }));

      return {
        ...day,
        slots: normalizedSlots,
        start: normalizedSlots[0].start,
        end: normalizedSlots[normalizedSlots.length - 1].end,
      };
    })
    .filter(Boolean);
