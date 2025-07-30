import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { calendarId } = await req.json();
  if (!calendarId) {
    return NextResponse.json({ error: "calendarId é obrigatório" }, { status: 400 });
  }
  await prisma.teacher.update({
    where: { email: session.user.email },
    data: { googleCalendarId: calendarId },
  });
  return NextResponse.json({ success: true });
} 