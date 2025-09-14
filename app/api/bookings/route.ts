import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { PaymentService } from "@/lib/payment";
import { AppError } from "@/errors/AppError";
import { findTeacherById } from "@/modules/teacher";

const timeSlotSchema = z.object({
  date: z.string(), // yyyy-MM-dd
  time: z.string(), // HH:mm
});

const bookingSchema = z.object({
  teacherId: z.string(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  date: z.string().optional(), // yyyy-MM-dd (para compatibilidade com agendamento único)
  time: z.string().optional(), // HH:mm (para compatibilidade com agendamento único)
  timeSlots: z.array(timeSlotSchema).optional(), // Para múltiplos horários
  studentPaymentMethod: z.enum(["creditCard", "paypal"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bookingData = bookingSchema.parse(body);

    const teacher = await findTeacherById(bookingData.teacherId, {
      paymentConfig: true,
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    const isBatchProcessing =
      bookingData.timeSlots && bookingData.timeSlots.length > 0;

    if (isBatchProcessing) {
      const timeSlots = bookingData.timeSlots.map((slot) => ({
        date: new Date(slot.date),
        time: slot.time.split(" - ")[0],
      }));

      const totalAmount = teacher.price * timeSlots.length;

      const paymentService = new PaymentService();
      const paymentSession = await paymentService.createPayment({
        amount: totalAmount,
        currency: teacher.currency,
        teacherId: teacher.id,
        studentEmail: bookingData.studentEmail,
        studentPaymentMethod: bookingData.studentPaymentMethod,
        paymentConfig: teacher.paymentConfig,
        metadata: {
          teacherId: teacher.id,
          studentEmail: bookingData.studentEmail,
          studentName: bookingData.studentName,
          date: timeSlots[0].date.toISOString().split("T")[0], // Usar a primeira data como referência
          time: timeSlots[0].time, // Usar o primeiro horário como referência
        },
        timeSlots,
        request: request,
      });

      return NextResponse.json({
        paymentUrl: paymentSession.url,
      });
    } else {
      const [startTime] = bookingData.time.split(" - ");

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
        request: request,
      });

      return NextResponse.json({
        paymentUrl: paymentSession.url,
      });
    }
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
