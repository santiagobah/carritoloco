import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { createToken, setAuthCookie } from '@/lib/auth';

// Simple rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return false;
  }

  loginAttempts.set(email, {
    count: attempts.count + 1,
    lastAttempt: now,
  });

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intente más tarde.' },
        { status: 429 }
      );
    }

    const result = await query(
      `SELECT p.person_id, p.name_p, p.ap_pat, p.ap_mat,
              up.email, up.password, up.is_admin
       FROM user_pass up
       JOIN personas p ON up.person_id = p.person_id
       WHERE up.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    loginAttempts.delete(email);

    const token = await createToken({
      userId: user.person_id,
      email: user.email,
      isAdmin: user.is_admin,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.person_id,
        email: user.email,
        name: `${user.name_p} ${user.ap_pat} ${user.ap_mat || ''}`.trim(),
        isAdmin: user.is_admin,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión', details: error.message },
      { status: 500 }
    );
  }
}
