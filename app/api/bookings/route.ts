
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleCalendarService } from '@/lib/google-calendar'
import { ZoomService } from '@/lib/zoom'
import { PaymentService } from '@/lib/payment'
import { z } from 'zod'

const bookingSchema = z.object({
  teacherId: z.string(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  date: z.string(),
  time: z.string(),
  paymentMethod: z.enum(['stripe', 'paypal', 'payoneer']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const bookingData = bookingSchema.parse(body)

    // Get teacher data with tokens and payment configs
    const teacher = await prisma.teacher.findUnique({
      where: { id: bookingData.teacherId },
      include: {
        paymentConfig: true,
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 })
    }

    // Verify availability
    const calendarService = new GoogleCalendarService(
      teacher.googleAccessToken!,
      teacher.googleRefreshToken!
    )

    const isAvailable = await calendarService.checkSlotAvailability(
      teacher.googleCalendarId || 'primary',
      bookingData.date,
      bookingData.time
    )

    if (!isAvailable) {
      return NextResponse.json({ error: 'Horário não disponível' }, { status: 400 })
    }

    // Create payment
    const paymentService = new PaymentService()
    const paymentSession = await paymentService.createPayment({
      amount: teacher.price,
      currency: teacher.currency,
      teacherId: teacher.id,
      studentEmail: bookingData.studentEmail,
      paymentMethod: bookingData.paymentMethod,
      paymentConfig: teacher.paymentConfig,
    })

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        teacherId: teacher.id,
        studentName: bookingData.studentName,
        studentEmail: bookingData.studentEmail,
        date: new Date(bookingData.date),
        time: bookingData.time,
        status: 'pending',
        paymentId: paymentSession.id,
        amount: teacher.price,
        currency: teacher.currency,
      }
    })

    return NextResponse.json({
      bookingId: booking.id,
      paymentUrl: paymentSession.url,
    })
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
