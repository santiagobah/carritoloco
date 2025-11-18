// frontend/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "email y password requeridos" }, { status: 400 });
    }

    const query = await db.query(
      "SELECT * FROM user_pass WHERE email = $1",
      [email]
    );

    if (query.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 400 });
    }

    const user = query.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 400 });
    }

    // Crear JWT (HS256) con jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({
      person_id: user.person_id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      // secure: process.env.NODE_ENV === "production", // activar en producción
    });

    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}