import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const { payload } = await jwtVerify(token, secret);

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");

  const protectedRoutes = ["/dashboard", "/anunciar"];

  if (protectedRoutes.some((r) => req.nextUrl.pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}