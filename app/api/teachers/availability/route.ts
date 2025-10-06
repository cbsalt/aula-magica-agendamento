import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { freeSlots, initializeSlots } from "app/api/helpers";
import { findTeacherById } from "@/modules/teacher";
import { getCalendarEvents } from "@/modules/calendar";

const availabilitySchema = z.object({
  teacherId: z.string(),
  date: z.string().optional(), // yyyy-MM-dd
});

const TOTAL_WEEKS = 16;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const WEEKS_TO_SHOW = body.weeks ?? TOTAL_WEEKS;
    const { teacherId } = availabilitySchema.parse(body);

    const teacher = await findTeacherById(teacherId, {
      teacherWorkSchedules: true,
    });

    if (!teacher?.googleAccessToken) {
      return NextResponse.json(
        { error: "Professor não conectou Google Calendar" },
        { status: 400 }
      );
    }

    const events = await getCalendarEvents(teacher);

    // Gera slots de acordo com a configuração semanal
    const workSchedules = teacher.teacherWorkSchedules || [];
    const allSlots = initializeSlots(workSchedules, WEEKS_TO_SHOW);

    return NextResponse.json({
      availability: freeSlots(events, allSlots),
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
