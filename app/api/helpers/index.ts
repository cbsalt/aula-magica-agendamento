import { addDays, addHours, format, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateSlots(start: string, end: string, dayDate: Date) {
  const dateFormat = "yyyy-MM-dd'T'HH:mm:ssXXX";
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
  const slots = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const current = new Date(dayDate);
  const zonedCurrent = toZonedTime(current, "America/Sao_Paulo");
  zonedCurrent.setHours(startHour, startMinute, 0, 0);

  const endTimeObj = new Date(dayDate);
  const zonedEndTimeObj = toZonedTime(endTimeObj, "America/Sao_Paulo");
  zonedEndTimeObj.setHours(endHour, endMinute, 0, 0);

  while (zonedCurrent < zonedEndTimeObj) {
    const slotStart = new Date(zonedCurrent);
    const slotEnd = addHours(slotStart, 1);

    if (slotEnd > zonedEndTimeObj) break;

    slots.push({
      start: format(slotStart, dateFormat),
      end: format(slotEnd, dateFormat),
      available: true,
    });

    zonedCurrent.setHours(zonedCurrent.getHours() + 1); // increment by 1 hour
  }
  return {
    label: capitalize(formatter.format(dayDate)),
    date: format(dayDate, "yyyy-MM-dd"),
    start: slots[0].start,
    end: slots[slots.length - 1].end,
    slots,
  };
}

export function initializeSlots(workSchedules, zonedToday) {
  let allSlots = [];

  for (const ws of workSchedules) {
    const startOfCurrentWeek = startOfWeek(zonedToday, {
      weekStartsOn: 0,
    });
    const dayDate = addDays(startOfCurrentWeek, ws.dayOfWeek);

    if (ws.startTime && ws.endTime) {
      allSlots = allSlots.concat(
        generateSlots(ws.startTime, ws.endTime, dayDate)
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
  allSlots.map((day) => {
    const availableSlots = day.slots.filter((slot) => isSlotFree(events, slot));

    if (availableSlots.length === 0) return null;

    return {
      ...day,
      slots: availableSlots,
      start: availableSlots[0].start,
      end: availableSlots[availableSlots.length - 1].end,
    };
  });
