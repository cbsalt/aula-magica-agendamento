import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    await prisma.teacher.update({
      where: { email: session.user.email },
      data: {
        zoomAccessToken: null,
        zoomRefreshToken: null,
        zoomConnected: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao desconectar Zoom:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
