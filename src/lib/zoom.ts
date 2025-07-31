import axios from "axios";
import { prisma } from "./prisma";

export class ZoomService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createMeeting(meetingData: {
    topic: string;
    start_time: string;
    duration: number;
    agenda?: string;
  }) {
    try {
      const response = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        {
          topic: meetingData.topic,
          type: 2, // Scheduled meeting
          start_time: meetingData.start_time,
          duration: meetingData.duration,
          agenda: meetingData.agenda,
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            watermark: false,
            use_pmi: false,
            approval_type: 0,
            audio: "both",
            auto_recording: "none",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating Zoom meeting:", error);
      throw error;
    }
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
}
