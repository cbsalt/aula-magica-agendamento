import { GoogleCalendarService } from "@/lib/google-calendar";

export function getCalendarEvents(teacher) {
  const calendarService = new GoogleCalendarService(
    teacher.googleAccessToken,
    teacher.googleRefreshToken
  );

  return calendarService.getEvents(teacher.email);
}
