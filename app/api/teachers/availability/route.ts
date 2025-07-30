import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { date, z } from "zod";
import {
  parseISO,
  getDay,
  startOfWeek,
  Day,
  addHours,
  endOfWeek,
  addDays,
  getDate,
} from "date-fns";
import { toZonedTime, format } from "date-fns-tz";
import { start } from "repl";
import { freeSlots, generateSlots, initializeSlots } from "app/api/helpers";

const availabilitySchema = z.object({
  teacherId: z.string(),
  date: z.string().optional(), // yyyy-MM-dd
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, date } = availabilitySchema.parse(body);

    // Busca dados do professor e horários configurados
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { teacherWorkSchedules: true },
    });
    if (!teacher?.googleAccessToken) {
      return NextResponse.json(
        { error: "Professor não conectou Google Calendar" },
        { status: 400 }
      );
    }

    // Busca eventos do calendário principal do Google
    const calendarService = new GoogleCalendarService(
      teacher.googleAccessToken,
      teacher.googleRefreshToken
    );

    const calendarId = teacher.email; // Calendário principal é o e-mail
    const events = await calendarService.getEvents(calendarId);

    // Gera slots de acordo com a configuração semanal
    const workSchedules = teacher.teacherWorkSchedules || [];
    const today = new Date();
    const zonedToday = toZonedTime(today, "America/Sao_Paulo");

    const allSlots = initializeSlots(workSchedules, zonedToday);

    return NextResponse.json({
      availability: freeSlots(allSlots),
      events: events.map((event) => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        description: event.description,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
