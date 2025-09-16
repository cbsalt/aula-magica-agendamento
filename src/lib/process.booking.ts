import { GoogleCalendarService } from "@/lib/google-calendar";
import {
  sendConfirmationEmail,
  sendBatchConfirmationEmail,
} from "app/api/mail/send-confirmation-email";
import { createZoomMeetingWithRetry } from "@/lib/zoom";
import { findTeacherById } from "@/modules/teacher";
import { updateBooking, findBookingsByBatchId } from "@/modules/booking";
import { Booking } from "@prisma/client";

export async function processBooking({
  booking,
  paymentId,
  metadata,
  teacherId,
  amount,
  currency,
}: {
  booking?: Booking;
  paymentId: string;
  metadata: {
    studentName: string;
    studentEmail: string;
    date: string;
    time: string;
  };
  teacherId: string;
  amount: number;
  currency: string;
}) {
  const teacher = await findTeacherById(teacherId);

  if (!teacher) return;

  const slotStart = new Date(`${metadata.date}T${metadata.time}`);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

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

  const calendarEvent = await calendarService.createEvent({
    summary: `Aula com ${metadata.studentName}`,
    description: `Aluno: ${metadata.studentName}\nEmail: ${metadata.studentEmail}`,
    start: { dateTime: slotStart },
    end: { dateTime: slotEnd },
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
      notes: "Pagamento confirmado",
    },
  });

  const formattedDate = formatDateForEmail(metadata.date, metadata.time);

  sendConfirmationEmail(
    metadata.studentEmail,
    metadata.studentName,
    formattedDate,
    meetingLink
  );
}

export async function processBatchBooking({
  masterBooking,
  paymentId,
  teacherId,
  amount,
  currency,
}: {
  masterBooking: Booking;
  paymentId: string;
  teacherId: string;
  amount: number;
  currency: string;
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

  function buildCalendarEvent(
    booking,
    slotStart: Date,
    slotEnd: Date,
    meetingLink?: string,
    withConference: boolean = false
  ) {
    return {
      summary: `Aula com ${booking.studentName}`,
      description: `Aluno: ${booking.studentName}\nEmail: ${
        booking.studentEmail
      }${meetingLink ? `\nLink da aula: ${meetingLink}` : ""}`,
      location: meetingLink || undefined,
      start: { dateTime: slotStart },
      end: { dateTime: slotEnd },
      ...(withConference && {
        conferenceData: {
          createRequest: {
            requestId: `unique-${Date.now()}-${booking.id}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    };
  }

  for (const [index, booking] of batchBookings.entries()) {
    const slotStart = new Date(
      `${booking.date.toISOString().split("T")[0]}T${booking.time}`
    );
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

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
          buildCalendarEvent(booking, slotStart, slotEnd, meetingLink)
        );
      } else {
        calendarEvent = await calendarService.createEvent(
          buildCalendarEvent(booking, slotStart, slotEnd, undefined, true)
        );

        meetingLink =
          calendarEvent.conferenceData?.entryPoints?.[0]?.uri || null;
      }
    } else {
      calendarEvent = await calendarService.createEvent(
        buildCalendarEvent(booking, slotStart, slotEnd, meetingLink)
      );
    }

    await updateBooking({
      booking,
      data: {
        status: "confirmed",
        meetLink: meetingLink,
        notes: "Pagamento confirmado",
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
    const formattedBookings = processedBookings.map((booking) => {
      let timeStr = booking.time;

      if (timeStr.length === 4 && !timeStr.includes(":")) {
        timeStr = `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
      }

      const dateStr = booking.date.toISOString().split("T")[0];

      return {
        formattedDateTime: formatDateForEmail(dateStr, timeStr, "pt-BR"),
        date: dateStr,
        time: timeStr,
        meetingLink: booking.meetingLink,
      };
    });

    await sendBatchConfirmationEmail(
      masterBooking.studentEmail,
      masterBooking.studentName,
      formattedBookings,
      amount,
      currency
    );
  }

  return processedBookings;
}

function formatDateForEmail(date: string, time: string, locale = "en-US") {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const dateObj = new Date(year, month - 1, day, hours, minutes);

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
}
