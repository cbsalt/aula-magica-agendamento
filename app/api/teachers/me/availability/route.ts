import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  createSchedule,
  findTeacherByEmail,
  removeOldSchedule,
} from "@/modules/teacher";

type TeacherSchedule = [
  {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }
];

// GET: Recupera o horário de trabalho semanal do professor autenticado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const teacher = await findTeacherByEmail(session.user.email, {
    teacherWorkSchedules: true,
  });

  if (!teacher) {
    return NextResponse.json(
      { error: "Professor não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(teacher.teacherWorkSchedules);
}

// POST: Salva ou atualiza o horário de trabalho semanal do professor autenticado
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const teacher = await findTeacherByEmail(session.user.email);

  if (!teacher) {
    return NextResponse.json(
      { error: "Professor não encontrado" },
      { status: 404 }
    );
  }

  const disponibility = (await req.json()) as Promise<TeacherSchedule>;

  if (!Array.isArray(disponibility)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  await removeOldSchedule(teacher.id);
  const scheduleCreated = await createSchedule(teacher.id, disponibility);

  return NextResponse.json({ success: true, count: scheduleCreated.count });
}
