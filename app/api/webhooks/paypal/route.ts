import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleCalendarService } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body || !body.event_type) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // Verifica se o evento é de aprovação de pagamento
  if (body.event_type === "CHECKOUT.ORDER.APPROVED") {
    const resource = body.resource;
    const purchaseUnit = resource.purchase_units?.[0];

    let metadata: {
      studentName: string;
      date: string;
      time: string;
      studentEmail: string;
      teacherId: string;
    };

    try {
      const decoded = Buffer.from(purchaseUnit.invoice_id, "base64").toString(
        "utf-8"
      );
      const parsed = JSON.parse(decoded);

      metadata = {
        studentName: parsed.studentName,
        date: parsed.date,
        time: parsed.time,
        studentEmail: parsed.studentEmail,
        teacherId: resource.custom_id,
      };
    } catch (err) {
      console.error("Erro ao decodificar invoice_id:", err);
      return NextResponse.json(
        { error: "Dados inválidos no invoice_id" },
        { status: 400 }
      );
    }

    const paymentId = resource.id;

    const existingBooking = await prisma.booking.findFirst({
      where: { paymentId },
    });

    if (!existingBooking || existingBooking.status === "confirmed") {
      return NextResponse.json({ ok: true });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: metadata.teacherId },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

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
      await prisma.booking.update({
        where: { id: existingBooking.id },
        data: {
          status: "failed",
          notes: "Horário indisponível no momento do pagamento (PayPal)",
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
