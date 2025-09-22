import {
  addDays,
  addHours,
  format,
  isBefore,
  setHours,
  setMinutes,
  startOfDay,
  startOfWeek,
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

export function generateSlots(start: string, end: string, dayDate: Date) {
  const hourFormat = "HH:mm";
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
  const slots = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const baseDate = startOfDay(new Date(dayDate));

  const zonedCurrent = setMinutes(setHours(baseDate, startHour), startMinute);
  const zonedEndTime = setMinutes(setHours(baseDate, endHour), endMinute);

  let current = zonedCurrent;

  while (
    isBefore(addHours(current, 1), zonedEndTime) ||
    +addHours(current, 1) === +zonedEndTime
  ) {
    const slotStart = current;
    const slotEnd = addHours(slotStart, 1);

    slots.push({
      start: format(slotStart, hourFormat),
      end: format(slotEnd, hourFormat),
      available: true,
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

  for (let weekOffset = 0; weekOffset < totalWeeks; weekOffset++) {
    for (const ws of workSchedules) {
      const startOfTargetWeek = addDays(
        startOfWeek(zonedToday, { weekStartsOn: 0 }),
        weekOffset * 7
      );

      const dayDate = addDays(startOfTargetWeek, ws.dayOfWeek);

      if (ws.startTime && ws.endTime) {
        allSlots = allSlots.concat(
          generateSlots(ws.startTime, ws.endTime, dayDate)
        );
      }
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
      const tzLabel = day.timezoneLabel ?? "-03:00";
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
