import { addHours, format, parse, parseISO, set } from "date-fns";
import { format as formatTz, toZonedTime } from "date-fns-tz";

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

export function getBrasiliaTimeLabel(date: Date = new Date()): string {
  const timeZone = "America/Sao_Paulo";
  const zonedDate = toZonedTime(date, timeZone);
  const offset = formatTz(zonedDate, "xxx", { timeZone });
  const shortOffset = offset.replace(/:00$/, "");

  return `Horário de Brasília (GMT${shortOffset})`;
}

export function getBookingDateTime(booking: {
  date: string;
  time: string;
}): Date {
  const date = parseISO(booking.date);
  const [hours, minutes] = booking.time.split(":").map(Number);
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
}

export const buildCalendarEvent = (
  booking,
  meetingLink?: string,
  withConference: boolean = false
) => {
  const timeZone = "America/Sao_Paulo";

  const slotStart = getBookingDateTime(booking);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

  const startDateTime = slotStart.toISOString();
  const endDateTime = slotEnd.toISOString();

  const startFormatted = `${slotStart.toLocaleDateString(
    "pt-BR"
  )} ${slotStart.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  const endFormatted = `${slotEnd.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })} BRT`;

  return {
    summary: `Aula com ${booking.studentName}`,
    description: `Aluno: ${booking.studentName}\nEmail: ${
      booking.studentEmail
    }${
      meetingLink ? `\nLink da aula: ${meetingLink}` : ""
    }\nHorário: ${startFormatted} – ${endFormatted}`,
    location: meetingLink || undefined,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
    ...(withConference && {
      conferenceData: {
        createRequest: {
          requestId: `unique-${Date.now()}-${booking.id}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    }),
  };
};
