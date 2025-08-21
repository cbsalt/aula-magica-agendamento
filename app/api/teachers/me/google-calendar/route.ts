import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { updateDataTeacher } from "@/modules/teacher";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { calendarId } = await req.json();

  if (!calendarId) {
    return NextResponse.json(
      { error: "calendarId é obrigatório" },
      { status: 400 }
    );
  }

  const data = { googleCalendarId: calendarId };
  await updateDataTeacher(session.user.email, data);

  return NextResponse.json({ success: true });
}
