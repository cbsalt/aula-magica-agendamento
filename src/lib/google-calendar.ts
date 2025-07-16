
import { google } from 'googleapis'

export class GoogleCalendarService {
  private oauth2Client: any

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  async getAvailability(calendarId: string, date: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const startTime = new Date(date)
    startTime.setHours(9, 0, 0, 0) // 9:00 AM

    const endTime = new Date(date)
    endTime.setHours(18, 0, 0, 0) // 6:00 PM

    try {
      // Get busy times
      const freebusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: calendarId }],
        },
      })

      const busyTimes = freebusyResponse.data.calendars?.[calendarId]?.busy || []
      
      // Get events for more details
      const eventsResponse = await calendar.events.list({
        calendarId,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      })

      const events = eventsResponse.data.items || []
      
      // Generate 1-hour slots
      const slots = []
      const current = new Date(startTime)

      while (current < endTime) {
        const slotEnd = new Date(current.getTime() + 60 * 60 * 1000) // 1 hour later
        
        const isAvailable = !busyTimes.some((busy: any) => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)
          return current < busyEnd && slotEnd > busyStart
        })

        // Find conflicting events
        const conflictingEvents = events.filter((event: any) => {
          const eventStart = new Date(event.start.dateTime || event.start.date)
          const eventEnd = new Date(event.end.dateTime || event.end.date)
          return current < eventEnd && slotEnd > eventStart
        })

        if (isAvailable) {
          slots.push({
            start: current.toTimeString().slice(0, 5), // HH:MM format
            end: slotEnd.toTimeString().slice(0, 5),
            available: true,
            conflictingEvents: conflictingEvents.map((event: any) => ({
              title: event.summary,
              start: event.start.dateTime || event.start.date,
              end: event.end.dateTime || event.end.date,
            })),
          })
        } else {
          slots.push({
            start: current.toTimeString().slice(0, 5),
            end: slotEnd.toTimeString().slice(0, 5),
            available: false,
            conflictingEvents: conflictingEvents.map((event: any) => ({
              title: event.summary,
              start: event.start.dateTime || event.start.date,
              end: event.end.dateTime || event.end.date,
            })),
          })
        }

        current.setTime(slotEnd.getTime())
      }

      return slots
    } catch (error) {
      console.error('Error fetching calendar availability:', error)
      throw error
    }
  }

  async getEvents(calendarId: string, date: string) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const startTime = new Date(date)
    startTime.setHours(0, 0, 0, 0)

    const endTime = new Date(date)
    endTime.setHours(23, 59, 59, 999)

    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  async checkSlotAvailability(calendarId: string, date: string, time: string): Promise<boolean> {
    const slots = await this.getAvailability(calendarId, date)
    return slots.some(slot => slot.start === time && slot.available)
  }

  async createEvent(calendarId: string, eventData: any) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
      })

      return response.data
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }
}
