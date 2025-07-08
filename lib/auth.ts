
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Create or update teacher record
          await prisma.teacher.upsert({
            where: { email: user.email! },
            update: {
              name: user.name!,
              photo: user.image,
              googleAccessToken: account.access_token,
              googleRefreshToken: account.refresh_token,
            },
            create: {
              email: user.email!,
              name: user.name!,
              photo: user.image,
              googleAccessToken: account.access_token,
              googleRefreshToken: account.refresh_token,
              price: 150, // Default price
              currency: 'BRL',
              slug: user.email!.split('@')[0],
            },
          })
        } catch (error) {
          console.error('Error creating teacher:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const teacher = await prisma.teacher.findUnique({
          where: { email: session.user.email },
          select: { id: true, slug: true },
        })
        if (teacher) {
          session.user.teacherId = teacher.id
          session.user.slug = teacher.slug
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
