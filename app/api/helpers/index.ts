import { addDays, addHours, format, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = "America/Sao_Paulo";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function filterSlotsWithMinAdvance(slots) {
  const nowInZone = new Date();
  // const nowInZone = toZonedTime(now, TIMEZONE);
  const minAdvanceDate = addHours(nowInZone, 12);

  return slots.filter((slot) => {
    const slotStart = new Date(slot.start);
    // const slotStart = toZonedTime(new Date(slot.start), TIMEZONE);
    return slotStart >= minAdvanceDate;
  });
}

export function generateSlots(start: string, end: string, dayDate: Date) {
  const dateFormat = "yyyy-MM-dd'T'HH:mm:ssXXX";
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
  const slots = [];
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const zonedCurrent = new Date(dayDate);
  // const zonedCurrent = toZonedTime(current, "America/Sao_Paulo");
  zonedCurrent.setHours(startHour, startMinute, 0, 0);

  const zonedEndTimeObj = new Date(dayDate);
  // const zonedEndTimeObj = toZonedTime(endTimeObj, "America/Sao_Paulo");
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

export function initializeSlots(workSchedules, totalWeeks = 0) {
  const zonedToday = new Date();
  // const zonedToday = toZonedTime(today, "America/Sao_Paulo");
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
      const availableSlots = day.slots.filter((slot) =>
        isSlotFree(events, slot)
      );
      const filteredSlots = filterSlotsWithMinAdvance(availableSlots);

      if (filteredSlots.length === 0) return null;

      return {
        ...day,
        slots: filteredSlots,
        start: filteredSlots[0].start,
        end: filteredSlots[filteredSlots.length - 1].end,
      };
    })
    .filter(Boolean);
