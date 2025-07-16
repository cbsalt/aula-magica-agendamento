import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleCalendarService } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseISO, getDay } from "date-fns";

const availabilitySchema = z.object({
  teacherId: z.string(),
  date: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacherId, date } = availabilitySchema.parse(body);

    // Get teacher's Google Calendar tokens
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

    const calendarService = new GoogleCalendarService(
      teacher.googleAccessToken,
      teacher.googleRefreshToken
    );

    const events = await calendarService.getEvents(
      teacher.googleCalendarId || "primary",
      date
    );

    // Gera intervalos livres com base nos horários de trabalho e eventos ocupados
    const workSchedules = teacher.teacherWorkSchedules || [];
    // Usa date-fns para garantir o cálculo correto do dia da semana no fuso local
    const dayOfWeek = getDay(parseISO(date));
    const daySchedules = workSchedules.filter(
      (ws) => ws.dayOfWeek === dayOfWeek
    );

    // Gera slots de 30 minutos dentro dos horários de trabalho
    function generateSlots(start: string, end: string) {
      const slots = [];
      let [h, m] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      while (h < eh || (h === eh && m < em)) {
        // Cria um novo objeto Date para o início do slot
        const slotStartDate = new Date(date);
        slotStartDate.setHours(h, m, 0, 0);
        // Calcula o fim do slot
        let nh = h;
        let nm = m + 30;
        if (nm >= 60) {
          nh++;
          nm = 0;
        }
        const slotEndDate = new Date(date);
        slotEndDate.setHours(nh, nm, 0, 0);
        // Se passou do horário de trabalho, para
        if (nh > eh || (nh === eh && nm > em)) break;
        slots.push({
          start: slotStartDate.toISOString(),
          end: slotEndDate.toISOString(),
          available: true,
        });
        h = nh;
        m = nm;
      }
      return slots;
    }

    // Todos os slots possíveis no dia, segundo o horário de trabalho
    let allSlots: { start: string; end: string; available: boolean }[] = [];
    for (const ws of daySchedules) {
      if (ws.startTime && ws.endTime) {
        allSlots = allSlots.concat(generateSlots(ws.startTime, ws.endTime));
      }
    }
    console.log("allSlots", allSlots);
    console.log("events", events);

    // Remove slots que conflitam com eventos ocupados
    function isSlotFree(slot: { start: string; end: string }) {
      return !events.some((event: any) => {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        const slotStartDate = new Date(slot.start);
        const slotEndDate = new Date(slot.end);
        return slotStartDate < eventEnd && slotEndDate > eventStart;
      });
    }
    const freeSlots = allSlots.filter(isSlotFree);

    console.log("freeSlots", freeSlots);

    return NextResponse.json({
      availability: freeSlots,
      events: events.map((event: any) => ({
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
