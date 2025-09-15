import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "./prisma";
import { updateDataTeacherById } from "@/modules/teacher";
import { googleConfig } from "@/config/google";

export const authOptions: NextAuthOptions = {
  providers: [GoogleProvider(googleConfig)],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered:", {
        userEmail: user.email,
        provider: account?.provider,
        hasAccessToken: !!account?.access_token,
      });

      // Allow all sign-ins
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
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
              currency: "BRL",
              slug:
                session.user.email.split("@")[0] +
                "-" +
                Math.random().toString(36).substr(2, 9),
              googleAccessToken: token.accessToken as string | undefined,
              googleRefreshToken: token.refreshToken as string | undefined,
              googleCalendarId: "primary",
            },
          });

          session.user.teacherId = teacher.id;
          session.user.slug = teacher.slug;
          session.user.zoomConnected = teacher.zoomConnected || false;

          if (!teacher.googleCalendarId) {
            await updateDataTeacherById(teacher.id, {
              googleCalendarId: "primary",
            });
          }
        } catch (error) {
          console.error("Error creating/updating teacher in session:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};
