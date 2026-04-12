import { NextRequest, NextResponse } from 'next/server';
import { getNachweisById, updateEntsorgungsnachweis } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { id } = await params;
  const item = getNachweisById(id, tenantId);
  if (!item) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { id } = await params;
  try {
    const data = await request.json();
    const existing = getNachweisById(id, tenantId);
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    updateEntsorgungsnachweis(id, tenantId, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
