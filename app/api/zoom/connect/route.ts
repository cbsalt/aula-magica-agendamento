
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { code } = await request.json()

    // Exchange code for tokens
    const tokenResponse = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/zoom/callback`
      })
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      return NextResponse.json({ error: tokens.error }, { status: 400 })
    }

    // Save tokens to database
    await prisma.teacher.update({
      where: { email: session.user.email },
      data: {
        zoomAccessToken: tokens.access_token,
        zoomRefreshToken: tokens.refresh_token,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao conectar Zoom:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
