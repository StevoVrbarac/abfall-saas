import { NextRequest, NextResponse } from 'next/server';
import { getTenantById } from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const tenantId = request.headers.get('x-tenant-id');
  const role = request.headers.get('x-role');
  const email = request.headers.get('x-email');
  const firstName = request.headers.get('x-first-name');
  const lastName = request.headers.get('x-last-name');

  const tenant = tenantId ? getTenantById(tenantId) : null;

  return NextResponse.json({ userId, tenantId, role, email, firstName, lastName, tenant });
}
