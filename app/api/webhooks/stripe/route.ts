import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { getStripeInstance } from "@/lib/payment";
import { sendTestEmail } from "app/api/mail/node-mailer";
import { sendConfirmationEmail } from "app/api/mail/send-confirmation-email";
import { createZoomMeetingWithRetry } from "@/lib/zoom";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const rawBody = await buffer(req.body);
  const sig = req.headers.get("stripe-signature") as string;
  const stripe = getStripeInstance();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    (async () => {
      try {
        await processSession(session);
      } catch (err) {
        console.error("Erro ao processar webhook async:", err);
      }
    })();

    return NextResponse.json({ received: true });
  }
}

async function processSession(session: any) {
  const metadata = session.metadata;
  const paymentId = session.id;

  if (!metadata) return;

  const [booking, teacher] = await Promise.all([
    prisma.booking.findFirst({ where: { paymentId } }),
    prisma.teacher.findUnique({ where: { id: metadata.teacherId } }),
  ]);

  if (!teacher) return;

  const calendarService = new GoogleCalendarService(
    teacher.googleAccessToken,
    teacher.googleRefreshToken
  );

  const calendarId = teacher.email;
  const slotStart = new Date(`${metadata.date}T${metadata.time}`);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

  const events = await calendarService.getEvents(calendarId);
  const isAvailable = !events.some((event) => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    return slotStart < end && slotEnd > start;
  });

  if (!isAvailable) {
    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "failed",
          notes: "Horário indisponível no momento do pagamento",
        },
      });
    }
    return;
  }

  let finalBooking = booking;

  if (!booking) {
    finalBooking = await prisma.booking.create({
      data: {
        teacherId: metadata.teacherId,
        studentName: metadata.studentName,
        studentEmail: metadata.studentEmail,
        date: new Date(metadata.date),
        time: metadata.time,
        status: "pending",
        paymentId,
        amount: session.amount_total / 100,
        currency: session.currency,
      },
    });
  }

  let meetingLink: string | null = null;

  if (teacher.zoomAccessToken && teacher.zoomRefreshToken) {
    meetingLink = await createZoomMeetingWithRetry(
      teacher,
      `Aula com ${metadata.studentName}`,
      slotStart,
      slotEnd
    );
  } else {
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

    meetingLink = calendarEvent.conferenceData?.entryPoints?.[0]?.uri || null;
  }

  await prisma.booking.update({
    where: { id: finalBooking.id },
    data: {
      status: "confirmed",
      meetLink: meetingLink,
    },
  });

  const formattedDate = formatDateForEmail(metadata.date, metadata.time);

  await sendConfirmationEmail(
    metadata.studentEmail,
    metadata.studentName,
    formattedDate,
    meetingLink
  );

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
