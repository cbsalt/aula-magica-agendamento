
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ZoomService } from '@/lib/zoom'
import { z } from 'zod'

const zoomConnectSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password } = zoomConnectSchema.parse(body)

    // Test Zoom authentication
    const zoomService = new ZoomService(undefined, email, password)
    const authResult = await zoomService.authenticate()

    // Save Zoom credentials to database
    await prisma.teacher.update({
      where: { email: session.user.email },
      data: {
        zoomEmail: email,
        zoomPassword: password, // In production, this should be encrypted
        zoomAccessToken: authResult.access_token,
        zoomRefreshToken: authResult.refresh_token,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao conectar Zoom:', error)
    return NextResponse.json({ error: 'Erro ao conectar Zoom. Verifique suas credenciais.' }, { status: 500 })
  }
}
