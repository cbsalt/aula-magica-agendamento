import { google } from "googleapis";
import { addDays } from "date-fns";

export class GoogleCalendarService {
  private oauth2Client: any;

  constructor(accessToken: string, refreshToken?: string) {
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

  async getEvents(calendarId: string) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const startTime = new Date();

    const endTime = addDays(startTime, 7);

    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        timeZone: "America/Sao_Paulo",
      });

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      throw error;
    }
  }

  async createEvent(calendarId: string, eventData: any) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
        conferenceDataVersion: 1,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }
}
