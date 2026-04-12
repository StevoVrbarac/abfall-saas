import { NextRequest, NextResponse } from 'next/server';
import { getAbfallEintragById, updateAbfallEintrag, deleteAbfallEintrag } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { id } = await params;
  const entry = getAbfallEintragById(id, tenantId);
  if (!entry) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { id } = await params;

  try {
    const data = await request.json();
    const existing = getAbfallEintragById(id, tenantId);
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

    updateAbfallEintrag(id, tenantId, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { id } = await params;

  const existing = getAbfallEintragById(id, tenantId);
  if (!existing) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

  deleteAbfallEintrag(id, tenantId);
  return NextResponse.json({ success: true });
}
