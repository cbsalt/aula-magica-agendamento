import { GoogleCalendarService } from "@/lib/google-calendar";
import { createZoomMeetingWithRetry } from "@/lib/zoom";
import { findBookingsByBatchId, updateBooking } from "@/modules/booking";
import { findTeacherById } from "@/modules/teacher";
import {
  addOneHour,
  buildCalendarEvent,
  getBookingDateTime,
  ONE_HOURS_MS,
} from "@/utils";
import { Booking } from "@prisma/client";
import {
  sendBatchConfirmationEmail,
  sendConfirmationEmail,
} from "app/api/mail/send-confirmation-email";
import { toZonedTime } from "date-fns-tz";

export async function processBooking({
  booking,
  metadata,
  teacherId,
}: {
  booking?: Booking;
  metadata: {
    studentName: string;
    studentEmail: string;
    date: string;
    time: string;
  };
  teacherId: string;
}) {
  const timeZone = "America/Sao_Paulo";

  const teacher = await findTeacherById(teacherId);

  if (!teacher) return { teacher: "Teacher not found" };

  const slotStart = toZonedTime(
    `${metadata.date}T${metadata.time}:00`,
    timeZone
  );
  const slotEnd = new Date(slotStart.getTime() + ONE_HOURS_MS);

  const calendarService = new GoogleCalendarService(
    teacher.googleAccessToken,
    teacher.googleRefreshToken,
    teacherId
  );

  const calendarId = teacher.email;

  const events = await calendarService.getEvents(calendarId);
  const isAvailable = !events.some((event) => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    return slotStart < end && slotEnd > start;
  });

  if (!isAvailable) {
    await updateBooking({
      booking,
      data: {
        status: "unavailable",
        notes: "Horário indisponível",
      },
    });
  }

  const startDateTime = `${metadata.date}T${metadata.time}:00`;
  const endDateTime = `${metadata.date}T${addOneHour(metadata.time)}:00`;

  const startFormatted = `${metadata.date} ${metadata.time}`;
  const endFormatted = `${addOneHour(metadata.time)} BRT`;

  const calendarEvent = await calendarService.createEvent({
    summary: `Aula com ${metadata.studentName}`,
    description: `Aluno: ${metadata.studentName}\nEmail: ${metadata.studentEmail}\nHorário: ${startFormatted} – ${endFormatted}`,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
    conferenceData: {
      createRequest: {
        requestId: `unique-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  });

  let meetingLink: string | null = null;

  if (teacher.zoomAccessToken && teacher.zoomRefreshToken) {
    meetingLink = await createZoomMeetingWithRetry(
      teacher,
      `Aula com ${metadata.studentName}`,
      slotStart,
      slotEnd
    );
  } else {
    meetingLink = calendarEvent.conferenceData?.entryPoints?.[0]?.uri || null;
  }

  await updateBooking({
    booking,
    data: {
      status: "confirmed",
      meetLink: meetingLink,
      googleEventId: calendarEvent.id,
      notes: "Pagamento confirmado",
    },
  });

  const initialSlot = getBookingDateTime({
    date: metadata.date,
    time: metadata.time,
  });

  const formattedDate = formatDateForEmail(initialSlot, "pt-BR");

  const rescheduleLink = `${process.env.NEXTAUTH_URL}/reschedule?bookingId=${booking?.id}`;

  sendConfirmationEmail(
    metadata.studentEmail,
    metadata.studentName,
    formattedDate,
    meetingLink,
    rescheduleLink
  );
}

export async function processBatchBooking({
  masterBooking,
  teacherId,
  amount,
  currency,
  paypalOrderId,
}: {
  masterBooking: Booking;
  teacherId: string;
  amount: number;
  currency: string;
  paypalOrderId?: string | null;
}) {
  const teacher = await findTeacherById(teacherId);
  if (!teacher) return;

  const batchBookings = await findBookingsByBatchId(masterBooking.batchId);
  if (batchBookings.length === 0) return;

  const calendarService = new GoogleCalendarService(
    teacher.googleAccessToken,
    teacher.googleRefreshToken,
    teacherId
  );

  const calendarId = teacher.email;
  const events = await calendarService.getEvents(calendarId);

  const processedBookings = [];

  let meetingLink: string | null = null;

  for (const [index, booking] of batchBookings.entries()) {
    const slotStart = getBookingDateTime(booking);
    const slotEnd = new Date(slotStart.getTime() + ONE_HOURS_MS);

    const isAvailable = !events.some((event) => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      return slotStart < end && slotEnd > start;
    });

    if (!isAvailable) {
      await updateBooking({
        booking,
        data: { status: "unavailable", notes: "Horário indisponível" },
      });
      continue;
    }

    let calendarEvent;

    if (index === 0) {
      if (teacher.zoomAccessToken && teacher.zoomRefreshToken) {
        meetingLink = await createZoomMeetingWithRetry(
          teacher,
          `Aulas com ${masterBooking.studentName}`,
          slotStart,
          slotEnd
        );

        calendarEvent = await calendarService.createEvent(
          buildCalendarEvent(booking, meetingLink)
        );
      } else {
        calendarEvent = await calendarService.createEvent(
          buildCalendarEvent(booking, undefined, true)
        );

        meetingLink =
          calendarEvent.conferenceData?.entryPoints?.[0]?.uri || null;
      }
    } else {
      calendarEvent = await calendarService.createEvent(
        buildCalendarEvent(booking, meetingLink)
      );
    }

    const amountPerBooking = booking.amount / batchBookings.length;

    await updateBooking({
      booking,
      data: {
        paypalOrderId,
        status: "confirmed",
        meetLink: meetingLink,
        googleEventId: calendarEvent.id,
        notes: "Pagamento confirmado",
        amount: amountPerBooking,
      },
    });

    processedBookings.push({
      ...booking,
      meetingLink,
      slotStart,
      slotEnd,
    });
  }

  if (processedBookings.length > 0) {
    processedBookings.sort(
      (a, b) => a.slotStart.getTime() - b.slotStart.getTime()
    );

    const formattedBookings = processedBookings.map((booking) => {
      const slotStart = getBookingDateTime({
        date: booking.date,
        time: booking.time,
      });

      return {
        formattedDateTime: formatDateForEmail(slotStart, "pt-BR"),
        meetingLink: booking.meetingLink,
      };
    });

    const rescheduleLink = `${process.env.NEXTAUTH_URL}/reschedule?batchId=${masterBooking.batchId}`;

    await sendBatchConfirmationEmail(
      masterBooking.studentEmail,
      masterBooking.studentName,
      formattedBookings,
      amount,
      currency,
      rescheduleLink
    );
  }

  return processedBookings;
}

function formatDateForEmail(dateObj: Date, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(dateObj);
}
