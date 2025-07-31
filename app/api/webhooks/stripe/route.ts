import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { getStripeInstance } from "@/lib/payment";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
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

    const metadata = session.metadata;

    // Evita duplicações
    const existingBooking = await prisma.booking.findFirst({
      where: { paymentId: session.id },
    });

    if (!existingBooking || existingBooking.status === "confirmed") {
      return NextResponse.json({ ok: true });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: metadata.teacherId },
    });

    if (!teacher)
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );

    // Verifica disponibilidade real no Google Calendar principal
    const calendarService = new GoogleCalendarService(
      teacher.googleAccessToken,
      teacher.googleRefreshToken
    );

    const calendarId = teacher.email;
    const slotStart = new Date(`${metadata.date}T${metadata.time}`);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

    // Verifica se o horário continua disponível
    const events = await calendarService.getEvents(calendarId);
    const isAvailable = !events.some((event) => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      return slotStart < end && slotEnd > start;
    });

    if (!isAvailable) {
      await prisma.booking.update({
        where: { id: existingBooking.id },
        data: {
          status: "failed",
          notes: "Horário indisponível no momento do pagamento",
        },
      });

      return NextResponse.json(
        { error: "Horário não disponível" },
        { status: 409 }
      );
    }

    const calendarEvent = await calendarService.createEvent(calendarId, {
      summary: `Aula com ${metadata.studentName}`,
      description: `Aluno: ${metadata.studentName}\nEmail: ${metadata.studentEmail}`,
      start: { dateTime: slotStart.toISOString() },
      end: { dateTime: slotEnd.toISOString() },
    });

    await prisma.booking.update({
      where: { id: existingBooking.id },
      data: {
        status: "confirmed",
        meetLink: calendarEvent?.hangoutLink || null,
      },
    });
  }

  return NextResponse.json({ received: true });
}
