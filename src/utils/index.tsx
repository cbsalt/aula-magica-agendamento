import { addHours, format, parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatDateString(date: string) {
  return formatInTimeZone(date, "America/Sao_Paulo", "HH:mm");
}

export function formatPeriod(dateStart, dateEnd) {
  return `${formatDateString(dateStart)} - ${formatDateString(dateEnd)}`;
}

export function addOneHour(time: string) {
  return format(addHours(parse(time, "HH:mm", new Date()), 1), "HH:mm");
}

export function handleFormatDate(booking) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(`${booking.date}T${booking.time}`));
}
