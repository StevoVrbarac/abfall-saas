import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersForAdmin, createUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  const users = getAllUsersForAdmin();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  try {
    const data = await request.json();

    if (!data.email || !data.password || !data.first_name || !data.last_name || !data.role || !data.tenant_id) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    }

    const id = createUser(data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Serverfehler';
    if (msg.includes('UNIQUE')) return NextResponse.json({ error: 'E-Mail bereits vergeben' }, { status: 409 });
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
