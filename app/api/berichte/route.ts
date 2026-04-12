import { NextRequest, NextResponse } from 'next/server';
import { getReportData } from '@/lib/db';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { searchParams } = new URL(request.url);

  const von = searchParams.get('von') || undefined;
  const bis = searchParams.get('bis') || undefined;

  const data = getReportData(tenantId, von, bis);
  return NextResponse.json(data);
}
