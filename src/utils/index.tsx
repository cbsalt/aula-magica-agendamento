import { addHours, format, parse } from "date-fns";

export function formatDateString(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPeriod(dateStart, dateEnd) {
  return `${dateStart} - ${dateEnd}`;
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

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
