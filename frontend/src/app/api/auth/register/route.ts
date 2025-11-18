// frontend/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, ap_pat, ap_mat, email, password } = body;

    if (!email || !password || !name || !ap_pat) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Verificar si ya existe
    const exists = await db.query("SELECT 1 FROM user_pass WHERE email = $1", [email]);
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
    }

    // Crear persona en la tabla personas (si usas la tabla personas original)
    const personRes = await db.query(
      `INSERT INTO personas (name_p, ap_pat, ap_mat, sell, buy)
       VALUES ($1, $2, $3, false, true) RETURNING person_id`,
      [name, ap_pat, ap_mat ?? ""]
    );

    const person_id = personRes.rows[0].person_id;

    // Hash de la contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Insertar en user_pass (email + hash)
    await db.query(
    `INSERT INTO user_pass (person_id, email, password)
    VALUES ($1, $2, $3)`,
    [person_id, email, hashed]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}