import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findTeacherByEmail } from "@/modules/teacher";
import { BookingsListResponseDto } from "@/types/booking-response.dto";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const teacher = await findTeacherByEmail(session.user.email);

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "confirmed";
    const limit = parseInt(searchParams.get("limit")) || 50;

    const bookings = await prisma.booking.findMany({
      where: {
        teacherId: teacher.id,
        status: status,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    const response: BookingsListResponseDto = {
      bookings: bookings.map((booking) => ({
        id: booking.id,
        studentName: booking.studentName,
        studentEmail: booking.studentEmail,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        amount: booking.amount,
        currency: booking.currency,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        meetLink: booking.meetLink,
        notes: booking.notes,
        paymentId: booking.paymentId,
        paypalOrderId: booking.paypalOrderId,
        googleEventId: booking.googleEventId,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar aulas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
