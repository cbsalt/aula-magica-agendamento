
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleCalendarService } from '@/lib/google-calendar'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const availabilitySchema = z.object({
  teacherId: z.string(),
  date: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, date } = availabilitySchema.parse(body)

    // Get teacher's Google Calendar tokens
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleCalendarId: true,
      }
    })

    if (!teacher?.googleAccessToken) {
      return NextResponse.json({ error: 'Professor não conectou Google Calendar' }, { status: 400 })
    }

    const calendarService = new GoogleCalendarService(
      teacher.googleAccessToken,
      teacher.googleRefreshToken
    )

    const availability = await calendarService.getAvailability(
      teacher.googleCalendarId || 'primary',
      date
    )

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
