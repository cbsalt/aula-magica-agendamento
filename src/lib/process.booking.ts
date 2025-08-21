// src/lib/process.booking.ts
import { GoogleCalendarService } from "@/lib/google-calendar";
import { sendConfirmationEmail } from "app/api/mail/send-confirmation-email";
import { createZoomMeetingWithRetry } from "@/lib/zoom";
import { findTeacherById } from "@/modules/teacher";
import { updateBooking } from "@/modules/booking";

export async function processBooking({
  booking,
  paymentId,
  metadata,
  teacherId,
  amount,
  currency,
}: {
  booking?: any;
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

  const calendarEvent = await calendarService.createEvent(calendarId, {
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

  // Envia email de confirmação
  // await sendConfirmationEmail(
  //   metadata.studentEmail,
  //   metadata.studentName,
  //   formattedDate,
  //   meetingLink
  // );

  // await sendTestEmail(
  //   metadata.studentEmail,
  //   metadata.studentName,
  //   formattedDate,
  //   meetingLink
  // );
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
