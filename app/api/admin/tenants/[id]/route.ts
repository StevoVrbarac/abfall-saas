import { NextRequest, NextResponse } from 'next/server';
import { getTenantById, updateTenant, getAbfallEintraege, getDashboardStats } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  const { id } = await params;
  const tenant = getTenantById(id);
  if (!tenant) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

  const stats = getDashboardStats(id);
  const recentEntries = getAbfallEintraege(id, { limit: 5 });

  return NextResponse.json({ tenant, stats, recentEntries });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  const { id } = await params;
  try {
    const data = await request.json();
    updateTenant(id, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
