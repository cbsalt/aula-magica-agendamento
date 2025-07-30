
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback triggered:', { 
        userEmail: user.email, 
        provider: account?.provider,
        hasAccessToken: !!account?.access_token 
      })
      
      // Allow all sign-ins
      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          // Create or update teacher record
          const teacher = await prisma.teacher.upsert({
            where: { email: session.user.email },
            update: {
              name: session.user.name!,
              photo: session.user.image,
              googleAccessToken: token.accessToken as string | undefined,
              googleRefreshToken: token.refreshToken as string | undefined,
            },
            create: {
              email: session.user.email,
              name: session.user.name!,
              photo: session.user.image,
              price: 150, // Default price
              currency: 'BRL',
              slug: session.user.email.split('@')[0] + '-' + Math.random().toString(36).substr(2, 9),
              googleAccessToken: token.accessToken as string | undefined,
              googleRefreshToken: token.refreshToken as string | undefined,
            },
          })
          session.user.teacherId = teacher.id
          session.user.slug = teacher.slug

          // Buscar e salvar o googleCalendarId se não estiver preenchido
          if (!teacher.googleCalendarId && teacher.googleAccessToken) {
            try {
              const { google } = await import('googleapis');
              const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.NEXTAUTH_URL + "/api/auth/callback/google"
              );
              oauth2Client.setCredentials({
                access_token: teacher.googleAccessToken,
                refresh_token: teacher.googleRefreshToken,
              });
              const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
              const res = await calendar.calendarList.list();
              const primary = res.data.items?.find((cal) => cal.primary);
              if (primary && primary.id) {
                await prisma.teacher.update({
                  where: { id: teacher.id },
                  data: { googleCalendarId: primary.id },
                });
              }
            } catch (err) {
              console.warn('Não foi possível salvar googleCalendarId:', err);
            }
          }
        } catch (error) {
          console.error('Error creating/updating teacher in session:', error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
}
