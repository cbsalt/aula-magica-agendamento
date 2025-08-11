import axios from "axios";
import { prisma } from "./prisma";

export class ZoomService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  static async updateZoomConnection(
    email: string,
    tokenData: {
      access_token: string;
      refresh_token: string;
    }
  ): Promise<void> {
    const { access_token, refresh_token } = tokenData;

    let isValid = false;

    try {
      const validation = await axios.get("https://api.zoom.us/v2/users/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      isValid = validation.status === 200;
    } catch (error) {
      console.warn(
        "Falha ao validar token do Zoom:",
        error?.response?.data || error
      );
    }

    await prisma.teacher.update({
      where: { email },
      data: {
        zoomAccessToken: access_token,
        zoomRefreshToken: refresh_token,
        zoomConnected: isValid,
      },
    });
  }

  static async refreshZoomAccessToken(refreshToken: string) {
    const basicAuth = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString("base64");

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await axios.post(
      "https://zoom.us/oauth/token",
      params.toString(),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  }
}

export async function createZoomMeeting(
  accessToken: string,
  topic: string,
  start: Date,
  end: Date
) {
  const durationMinutes = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60)
  );

  const response = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic,
      type: 2, // reunião agendada
      start_time: start.toISOString(),
      duration: durationMinutes,
      timezone: "America/Sao_Paulo",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data?.join_url || null;
}

export async function createZoomMeetingWithRetry(
  teacher: { zoomAccessToken: string; zoomRefreshToken: string; email: string },
  topic: string,
  start: Date,
  end: Date
) {
  try {
    return await createZoomMeeting(teacher.zoomAccessToken, topic, start, end);
  } catch (error: any) {
    if (error.response?.status === 401) {
      const tokens = await ZoomService.refreshZoomAccessToken(
        teacher.zoomRefreshToken
      );

      await prisma.teacher.update({
        where: { email: teacher.email },
        data: {
          zoomAccessToken: tokens.accessToken,
          zoomRefreshToken: tokens.refreshToken,
        },
      });

      return await createZoomMeeting(tokens.accessToken, topic, start, end);
    }
    throw error;
  }
}
