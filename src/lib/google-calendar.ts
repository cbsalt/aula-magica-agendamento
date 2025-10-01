import { google } from "googleapis";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { updateDataTeacher, updateDataTeacherById } from "@/modules/teacher";

export class GoogleCalendarService {
  private oauth2Client;
  private refreshToken?: string;
  private teacherId?: string;

  constructor(accessToken: string, refreshToken?: string, teacherId?: string) {
    this.refreshToken = refreshToken;
    this.teacherId = teacherId;

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + "/api/auth/callback/google"
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  private async requestWithRefresh<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (err.code === 401 && this.refreshToken) {
        console.log("🔄 Google access token expirado. Tentando refresh...");

        const { credentials } = await this.oauth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;

        this.oauth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token: this.refreshToken,
        });

        // Salva novo token no DB se teacherId estiver disponível
        if (this.teacherId && newAccessToken) {
          const data = { googleAccessToken: newAccessToken };
          await updateDataTeacherById(this.teacherId, data);
        }

        return await fn(); // tenta de novo
      }
      throw err;
    }
  }

  async getEvents(calendarId: string) {
    return this.requestWithRefresh(async () => {
      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });
      const startTime = new Date();
      const endTime = addDays(startTime, 7);

      const response = await calendar.events.list({
        calendarId,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        timeZone: "America/Sao_Paulo",
      });

      return response.data.items || [];
    });
  }

  async createEvent(eventData) {
    return this.requestWithRefresh(async () => {
      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventData,
        conferenceDataVersion: 1,
      });

      return response.data;
    });
  }

  async updateEvent(calendarId: string, eventId: string, eventData) {
    return this.requestWithRefresh(async () => {
      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });

      const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventData,
        conferenceDataVersion: 1,
      });

      return response.data;
    });
  }
}
