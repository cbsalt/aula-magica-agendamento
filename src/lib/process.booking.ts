// src/lib/process.booking.ts
import { prisma } from "@/lib/prisma";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { sendConfirmationEmail } from "app/api/mail/send-confirmation-email";
import { createZoomMeetingWithRetry } from "@/lib/zoom";

export async function processBooking({
  paymentId,
  metadata,
  teacherId,
  amount,
  currency,
}: {
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
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
  });

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
    await prisma.booking.create({
      data: {
        teacherId,
        studentName: metadata.studentName,
        studentEmail: metadata.studentEmail,
        date: new Date(metadata.date),
        time: metadata.time,
        status: "failed",
        paymentId,
        amount,
        currency,
        notes: "Horário indisponível",
      },
    });
    return;
  }

  const booking = await prisma.booking.create({
    data: {
      teacherId,
      studentName: metadata.studentName,
      studentEmail: metadata.studentEmail,
      date: new Date(metadata.date),
      time: metadata.time,
      status: "pending",
      paymentId,
      amount,
      currency,
    },
  });

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

  // Atualiza booking para "confirmed"
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "confirmed",
      meetLink: meetingLink,
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
