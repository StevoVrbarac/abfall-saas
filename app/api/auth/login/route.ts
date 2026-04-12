import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, updateUserLastLogin } from '@/lib/db';
import { signSession, setSessionCookie, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort erforderlich' }, { status: 400 });
    }

    const user = getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten' }, { status: 401 });
    }

    updateUserLastLogin(user.id);

    const token = await signSession({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });

    const redirectTo = user.role === 'admin' ? '/admin' : '/dashboard';
    const response = NextResponse.json({ success: true, redirectTo });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
