import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "src/lib/auth";
import { prisma } from "src/lib/prisma";

// GET: Recupera o horário de trabalho semanal do professor autenticado
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { email: session.user.email },
    include: { teacherWorkSchedules: true },
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

  const teacher = await prisma.teacher.findUnique({
    where: { email: session.user.email },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: "Professor não encontrado" },
      { status: 404 }
    );
  }

  const body = await req.json();
  // body deve ser um array de objetos: [{ dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, ...]
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  // Remove horários antigos
  await prisma.teacherWorkSchedule.deleteMany({
    where: { teacherId: teacher.id },
  });

  // Cria novos horários
  const created = await prisma.teacherWorkSchedule.createMany({
    data: body.map((item: any) => ({
      teacherId: teacher.id,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
    })),
  });

  return NextResponse.json({ success: true, count: created.count });
}
