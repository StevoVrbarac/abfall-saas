import { NextRequest, NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/db';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  const stats = getAdminStats();
  return NextResponse.json(stats);
}
