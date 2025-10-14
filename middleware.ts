import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const allowedOrigins = ["http://localhost:3000", "https://scheduleasier.com"];
  const origin = request.headers.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const session = await getToken({ req: request, secret: authOptions.secret });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
