import { addHours, format, parse } from "date-fns";

export function formatDateString(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPeriod(dateStart, dateEnd) {
  return `${formatDateString(dateStart)} - ${formatDateString(dateEnd)}`;
}

export function addOneHour(time: string) {
  return format(addHours(parse(time, "HH:mm", new Date()), 1), "HH:mm");
}
