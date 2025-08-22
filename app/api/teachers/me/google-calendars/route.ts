import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { findTeacherByEmail } from "@/modules/teacher";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const teacher = await findTeacherByEmail(session.user.email);

  if (!teacher?.googleAccessToken) {
    return NextResponse.json(
      { error: "Google Calendar não conectado" },
      { status: 400 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );

  oauth2Client.setCredentials({
    access_token: teacher.googleAccessToken,
    refresh_token: teacher.googleRefreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const res = await calendar.calendarList.list();
  const calendars =
    res.data.items?.map((cal) => ({
      id: cal.id,
      summary: cal.summary,
      primary: cal.primary,
    })) || [];

  return NextResponse.json({ calendars });
}
