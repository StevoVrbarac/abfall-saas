import { NextRequest, NextResponse } from 'next/server';
import { getEntsorgungsnachweise, createEntsorgungsnachweis } from '@/lib/db';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { searchParams } = new URL(request.url);

  const result = getEntsorgungsnachweise(tenantId, {
    status: searchParams.get('status') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const userId = request.headers.get('x-user-id') || '';

  try {
    const data = await request.json();
    const id = createEntsorgungsnachweis(tenantId, userId, data);
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
