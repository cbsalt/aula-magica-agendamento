import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { PaymentService } from "@/lib/payment";
import { z } from "zod";

const bookingSchema = z.object({
  teacherId: z.string(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  date: z.string(), // yyyy-MM-dd
  time: z.string(), // HH:mm
  studentPaymentMethod: z.enum(["stripe", "paypal"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingData = bookingSchema.parse(body);

    // Busca dados do professor
    const teacher = await prisma.teacher.findUnique({
      where: { id: bookingData.teacherId },
      include: { paymentConfig: true },
    });
    if (!teacher?.googleAccessToken) {
      return NextResponse.json(
        { error: "Professor não conectou Google Calendar" },
        { status: 400 }
      );
    }

    // Verifica disponibilidade real no Google Calendar principal
    const calendarService = new GoogleCalendarService(
      teacher.googleAccessToken,
      teacher.googleRefreshToken
    );
    const calendarId = teacher.email; // Calendário principal
    const slotStart = new Date(`${bookingData.date}T${bookingData.time}`);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1h depois
    const events = await calendarService.getEvents(calendarId);
    const isAvailable = !events.some((event) => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      return slotStart < eventEnd && slotEnd > eventStart;
    });
    if (!isAvailable) {
      return NextResponse.json(
        { error: "Horário não disponível" },
        { status: 400 }
      );
    }

    // Cria evento no Google Calendar do professor
    let calendarEvent;
    try {
      calendarEvent = await calendarService.createEvent(calendarId, {
        summary: `Aula com ${bookingData.studentName}`,
        description: `Aluno: ${bookingData.studentName}\nEmail: ${bookingData.studentEmail}`,
        start: { dateTime: slotStart.toISOString() },
        end: { dateTime: slotEnd.toISOString() },
      });
    } catch (err) {
      return NextResponse.json(
        { error: "Erro ao criar evento no Google Calendar" },
        { status: 500 }
      );
    }

    // Cria pagamento
    const paymentService = new PaymentService();
    const paymentSession = await paymentService.createPayment({
      amount: teacher.price,
      currency: teacher.currency,
      teacherId: teacher.id,
      studentEmail: bookingData.studentEmail,
      studentPaymentMethod: bookingData.studentPaymentMethod,
      paymentConfig: teacher.paymentConfig,
    });

    // Cria booking
    const booking = await prisma.booking.create({
      data: {
        teacherId: teacher.id,
        studentName: bookingData.studentName,
        studentEmail: bookingData.studentEmail,
        date: new Date(bookingData.date),
        time: bookingData.time,
        status: "pending",
        paymentId: paymentSession.id,
        amount: teacher.price,
        currency: teacher.currency,
        meetLink: calendarEvent?.hangoutLink || null,
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      paymentUrl: paymentSession.url,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
