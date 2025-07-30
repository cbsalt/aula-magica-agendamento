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

  async getAvailability(
    calendarId: string,
    date: string,
    scheduleStartHour: number,
    scheduleEndHour: number
  ) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const startTime = new Date(date);
    startTime.setHours(scheduleStartHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(scheduleEndHour, 0, 0, 0);

    try {
      const eventsResponse = await calendar.events.list({
        calendarId,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = eventsResponse.data.items || [];

      const slots = [];
      const current = new Date(startTime);

      while (current < endTime) {
        const slotEnd = new Date(current.getTime() + 60 * 60 * 1000); // 1 hora depois

        // Verifica se há conflito com eventos
        const conflictingEvents = events.filter((event: any) => {
          const eventStart = new Date(event.start.dateTime || event.start.date);
          const eventEnd = new Date(event.end.dateTime || event.end.date);
          // slot (current -> slotEnd) colide com evento (eventStart -> eventEnd)
          return slotEnd > eventStart && current < eventEnd;
        });

        const isAvailable = conflictingEvents.length === 0;

        slots.push({
          start: current.toTimeString().slice(0, 5),
          end: slotEnd.toTimeString().slice(0, 5),
          available: isAvailable,
          conflictingEvents: conflictingEvents.map((event: any) => ({
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
          })),
        });

        current.setTime(slotEnd.getTime());
      }

      return slots;
    } catch (error) {
      console.error("Error fetching calendar availability:", error);
      throw error;
    }
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

  async checkSlotAvailability(
    calendarId: string,
    date: string,
    time: string
  ): Promise<boolean> {
    const slots = await this.getAvailability(calendarId, date);
    return slots.some((slot) => slot.start === time && slot.available);
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
      });

      return response.data;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }
}
