import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { ZoomService } from "@/lib/zoom";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const redirectUri = `${req.nextUrl.origin}/api/zoom/connect`;

  if (!code) {
    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard?error=missing_code`
    );
  }

  try {
    const tokenResponse = await axios.post(
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
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.redirect(
        `${req.nextUrl.origin}/dashboard?zoom=error_no_email`
      );
    }

    await ZoomService.updateZoomConnection(email, {
      access_token: tokenResponse.data.access_token,
      refresh_token: tokenResponse.data.refresh_token,
    });

    return NextResponse.redirect(
      `${req.nextUrl.origin}/dashboard?zoom=success&tab=integrations`
    );
  } catch (err) {
    console.error("Erro no callback Zoom:", err?.response?.data || err);
    return NextResponse.redirect(`${req.nextUrl.origin}/dashboard?zoom=error`);
  }
}
