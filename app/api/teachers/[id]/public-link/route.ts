import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const generateLinkSchema = z.object({
  price: z.number().positive(),
  currency: z.string().default('BRL'),
  paymentMethod: z.enum(['stripe', 'paypal']),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verify teacher exists and belongs to the user
    const teacher = await prisma.teacher.findFirst({
      where: {
        id: params.id,
        email: session.user.email,
      },
      include: {
        paymentConfig: true,
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const { price, currency, paymentMethod } = generateLinkSchema.parse(body)

    // Generate unique public link ID
    const publicLinkId = randomUUID()

    // Update teacher with new price and public link
    const updatedTeacher = await prisma.teacher.update({
      where: { id: params.id },
      data: {
        price,
        currency,
        publicLinkId,
        paymentConfig: {
          upsert: {
            create: {
              teacherId: params.id,
              defaultMethod: paymentMethod,
            },
            update: {
              defaultMethod: paymentMethod,
            },
          },
        },
      },
      include: {
        paymentConfig: true,
      }
    })

    const publicUrl = `${process.env.NEXTAUTH_URL}/appointment/${publicLinkId}`

    return NextResponse.json({
      success: true,
      publicUrl,
      teacher: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        price: updatedTeacher.price,
        currency: updatedTeacher.currency,
        publicLinkId: updatedTeacher.publicLinkId,
      }
    })
  } catch (error) {
    console.error('Erro ao gerar link público:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 