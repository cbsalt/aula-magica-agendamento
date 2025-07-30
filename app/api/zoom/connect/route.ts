import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const redirectUri = `${req.nextUrl.origin}/api/zoom/callback`;

  if (!code) {
    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard?error=missing_code`
    );
  }

  try {
    const response = await axios.post(
      "https://zoom.us/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const session = await getServerSession(authOptions);

    await prisma.teacher.update({
      where: { email: session?.user?.email },
      data: {
        zoomAccessToken: response.data.access_token,
        zoomRefreshToken: response.data.refresh_token,
      },
    });

    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard?zoom=success`
    );
  } catch (err) {
    console.error("Erro no callback Zoom:", err);
    return NextResponse.redirect(`${req.nextUrl.origin}/dashboard?zoom=error`);
  }
}
