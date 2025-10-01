import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { GoogleCalendarService } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { findTeacherById } from "@/modules/teacher";
import { buildCalendarEvent, getBookingDateTime, ONE_HOURS_MS } from "@/utils";
import { addHours, isBefore } from "date-fns";

const timeSlotSchema = z.object({
  id: z.string(),
  date: z.string(),
  time: z.string(),
});

const bodySchema = z.object({
  bookingId: z.string().optional(),
  batchId: z.string().optional(),
  timeSlots: z.array(timeSlotSchema),
});

export async function PUT(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());

    if (!body.bookingId && !body.batchId) {
      return NextResponse.json(
        { error: "Informe bookingId ou batchId" },
        { status: 400 }
      );
    }

    const bookings = body.bookingId
      ? await prisma.booking.findMany({ where: { id: body.bookingId } })
      : await prisma.booking.findMany({
          where: { batchId: body.batchId as string },
          orderBy: { createdAt: "asc" },
        });

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: "Booking(s) não encontrado(s)" },
        { status: 404 }
      );
    }

    const now = new Date();
    for (const booking of bookings) {
      const originalStart = getBookingDateTime(booking);

      const hoursUntil =
        (originalStart.getTime() - now.getTime()) / ONE_HOURS_MS;

      if (hoursUntil < 12) {
        return NextResponse.json(
          { error: "Reagendamento permitido apenas com 12h de antecedência" },
          { status: 409 }
        );
      }
    }

    const teacherId = bookings[0].teacherId;
    const teacher = await findTeacherById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    const calendarService = new GoogleCalendarService(
      teacher.googleAccessToken,
      teacher.googleRefreshToken,
      teacher.id
    );
    const calendarId = teacher.email;
    const events = await calendarService.getEvents(calendarId);

    const isOverlap = (start: Date, end: Date) => {
      return events.some((event) => {
        const eStart = new Date(event.start.dateTime || event.start.date);
        const eEnd = new Date(event.end.dateTime || event.end.date);
        return start < eEnd && end > eStart;
      });
    };

    for (let i = 0; i < body.timeSlots.length; i++) {
      const slot = body.timeSlots[i] as { date: string; time: string };
      const start = getBookingDateTime(slot);
      const end = new Date(start.getTime() + ONE_HOURS_MS);

      const hoursFromNow = (start.getTime() - now.getTime()) / ONE_HOURS_MS;
      if (hoursFromNow < 12) {
        return NextResponse.json(
          { error: "Novo horário deve ter no mínimo 12h de antecedência" },
          { status: 409 }
        );
      }

      if (isOverlap(start, end)) {
        return NextResponse.json(
          { error: "Horário indisponível no calendário" },
          { status: 409 }
        );
      }
    }

    const updates = await Promise.all(
      body.timeSlots.map(async (slot) => {
        const booking = await prisma.booking.update({
          where: { id: slot.id },
          data: {
            date: slot.date,
            time: slot.time,
            notes: "Reagendado pelo aluno",
          },
        });

        if (booking.googleEventId) {
          const eventData = buildCalendarEvent({
            ...booking,
            date: slot.date,
            time: slot.time,
          });

          await calendarService.updateEvent(
            calendarId,
            booking.googleEventId,
            eventData
          );
        }

        return booking;
      })
    );

    return NextResponse.json({ success: true, bookings: updates });
  } catch (err) {
    if (err?.name === "ZodError") {
      return NextResponse.json(
        { error: err.issues?.[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }
    console.error("Erro ao reagendar:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  const batchId = searchParams.get("batchId");

  if (!bookingId && !batchId) {
    return NextResponse.json(
      { error: "Informe bookingId ou batchId" },
      { status: 400 }
    );
  }

  const where = bookingId ? { id: bookingId } : { batchId: batchId as string };
  const bookings = await prisma.booking.findMany({
    where,
  });
  if (bookings.length === 0) {
    return NextResponse.json(
      { error: "Booking(s) não encontrado(s)" },
      { status: 404 }
    );
  }

  const now = new Date();

  const validBookings = bookings.filter((booking) => {
    const slotStart = getBookingDateTime(booking);

    if (isBefore(slotStart, now) || isBefore(slotStart, addHours(now, 12))) {
      return false;
    }

    return true;
  });

  if (validBookings.length === 0) {
    return NextResponse.json(
      { error: "Nenhum booking disponível para reagendamento" },
      { status: 400 }
    );
  }

  const orderedBookings = validBookings
    .map((b) => {
      const slotStart = getBookingDateTime(b);
      const slotEnd = new Date(slotStart.getTime() + ONE_HOURS_MS);

      return { ...b, slotStart, slotEnd };
    })
    .sort((a, b) => a.slotStart.getTime() - b.slotStart.getTime());

  return NextResponse.json({
    bookings: orderedBookings.map(
      ({ id, batchId, studentName, studentEmail, date, time, teacherId }) => ({
        id,
        batchId,
        studentName,
        studentEmail,
        date,
        time,
        teacherId,
      })
    ),
  });
}
