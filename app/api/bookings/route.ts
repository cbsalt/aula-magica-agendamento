import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentService } from "@/lib/payment";
import { z } from "zod";

const bookingSchema = z.object({
  teacherId: z.string(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  date: z.string(), // yyyy-MM-dd
  time: z.string(), // HH:mm
  studentPaymentMethod: z.enum(["creditCard", "paypal"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingData = bookingSchema.parse(body);
    const [startTime] = bookingData.time.split(" - ");

    // Busca dados do professor
    const teacher = await prisma.teacher.findUnique({
      where: { id: bookingData.teacherId },
      include: { paymentConfig: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    const paymentService = new PaymentService();
    const paymentSession = await paymentService.createPayment({
      amount: teacher.price,
      currency: teacher.currency,
      teacherId: teacher.id,
      studentEmail: bookingData.studentEmail,
      studentPaymentMethod: bookingData.studentPaymentMethod,
      paymentConfig: teacher.paymentConfig,
      metadata: {
        teacherId: teacher.id,
        studentEmail: bookingData.studentEmail,
        studentName: bookingData.studentName,
        date: bookingData.date,
        time: startTime,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        teacherId: teacher.id,
        studentName: bookingData.studentName,
        studentEmail: bookingData.studentEmail,
        date: new Date(bookingData.date),
        time: startTime,
        status: "pending",
        paymentId: paymentSession.id,
        amount: teacher.price,
        currency: teacher.currency,
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
