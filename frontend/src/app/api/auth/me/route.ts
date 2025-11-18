// frontend/src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(req: Request) {
  try {
    // obtener cookie token (simple parse)
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.split("; ").find((c) => c.startsWith("token="));
    if (!match) return NextResponse.json({ user: null }, { status: 401 });

    const token = match.split("=")[1];
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({ user: payload });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}