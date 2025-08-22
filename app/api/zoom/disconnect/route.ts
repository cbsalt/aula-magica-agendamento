import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { updateDataTeacher } from "@/modules/teacher";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const data = {
      zoomAccessToken: null,
      zoomRefreshToken: null,
      zoomConnected: false,
    };

    await updateDataTeacher(session.user.email, data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao desconectar Zoom:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
