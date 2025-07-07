
export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export interface FreeBusyResponse {
  calendars: {
    [calendarId: string]: {
      busy: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

export class GoogleCalendarService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getFreeBusy(calendarId: string, timeMin: string, timeMax: string): Promise<FreeBusyResponse> {
    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: calendarId }],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar availability');
    }

    return response.json();
  }

  generateTimeSlots(date: Date, busyTimes: Array<{ start: string; end: string }>, workingHours = { start: 9, end: 18 }): Array<{ start: string; end: string; available: boolean }> {
    const slots = [];
    const startTime = new Date(date);
    startTime.setHours(workingHours.start, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(workingHours.end, 0, 0, 0);

    const slotDuration = 60; // 1 hour slots
    
    while (startTime < endTime) {
      const slotEnd = new Date(startTime.getTime() + slotDuration * 60000);
      
      const isAvailable = !busyTimes.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (startTime < busyEnd && slotEnd > busyStart);
      });

      slots.push({
        start: startTime.toISOString(),
        end: slotEnd.toISOString(),
        available: isAvailable
      });

      startTime.setTime(slotEnd.getTime());
    }

    return slots;
  }

  async createEvent(calendarId: string, event: {
    summary: string;
    description?: string;
    start: { dateTime: string };
    end: { dateTime: string };
    attendees?: Array<{ email: string }>;
  }) {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error('Failed to create calendar event');
    }

    return response.json();
  }
}
