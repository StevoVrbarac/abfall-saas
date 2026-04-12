import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile, updateUserPasswordHash } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || '';
  const user = getUserById(userId);
  if (!user) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  const { password_hash: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function PUT(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || '';

  try {
    const data = await request.json();

    if (data.type === 'profile') {
      if (!data.first_name || !data.last_name || !data.email) {
        return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
      }
      updateUserProfile(userId, { first_name: data.first_name, last_name: data.last_name, email: data.email });
      return NextResponse.json({ ok: true });
    }

    if (data.type === 'password') {
      if (!data.old_password || !data.new_password) {
        return NextResponse.json({ error: 'Passwörter fehlen' }, { status: 400 });
      }
      const user = getUserById(userId);
      if (!user) return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });

      const valid = bcrypt.compareSync(data.old_password, user.password_hash);
      if (!valid) return NextResponse.json({ error: 'Aktuelles Passwort falsch' }, { status: 400 });

      const hash = bcrypt.hashSync(data.new_password, 10);
      updateUserPasswordHash(userId, hash);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Ungültiger Typ' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
