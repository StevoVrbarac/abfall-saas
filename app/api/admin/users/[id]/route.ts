import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile, updateUserPasswordHash, deactivateUser, activateUser } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  const { id } = await params;

  try {
    const data = await request.json();

    if (data.action === 'deactivate') {
      deactivateUser(id);
      return NextResponse.json({ ok: true });
    }
    if (data.action === 'activate') {
      activateUser(id);
      return NextResponse.json({ ok: true });
    }

    if (data.first_name && data.last_name && data.email) {
      updateUserProfile(id, { first_name: data.first_name, last_name: data.last_name, email: data.email });
    }

    if (data.new_password) {
      const hash = bcrypt.hashSync(data.new_password, 10);
      updateUserPasswordHash(id, hash);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  const { id } = await params;
  const user = getUserById(id);
  if (!user) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

  const { password_hash: _, ...safe } = user;
  return NextResponse.json(safe);
}
