
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        description: true,
        price: true,
        currency: true,
        slug: true,
        isActive: true,
        createdAt: true,
      }
    })

    if (!teacher || !teacher.isActive) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Erro ao buscar professor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
