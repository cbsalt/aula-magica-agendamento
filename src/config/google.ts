export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid email profile https://www.googleapis.com/auth/calendar",
      access_type: "offline",
      prompt: "consent",
    },
  },
};
