import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "src/lib/auth";
import { prisma } from "src/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      description: true,
      googleAccessToken: true,
    },
  });

  if (!teacher) {
    return NextResponse.json(
      { error: "Professor não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: teacher.id,
    email: teacher.email,
    name: teacher.name,
    description: teacher.description,
    googleCalendarConnected: !!teacher.googleAccessToken,
  });
}
