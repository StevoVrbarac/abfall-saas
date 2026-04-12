import { NextRequest, NextResponse } from 'next/server';
import { getAllTenants, createTenant, createUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  const tenants = getAllTenants();
  return NextResponse.json(tenants);
}

export async function POST(request: NextRequest) {
  const role = request.headers.get('x-role');
  if (role !== 'admin') return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

  try {
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Firmenname erforderlich' }, { status: 400 });
    }

    const tenantId = createTenant(data);

    // Create initial admin user for tenant if provided
    if (data.admin_email && data.admin_password) {
      createUser({
        tenant_id: tenantId,
        email: data.admin_email,
        password: data.admin_password,
        first_name: data.admin_first_name || 'Admin',
        last_name: data.admin_last_name || 'User',
        role: 'tenant_admin',
      });
    }

    return NextResponse.json({ id: tenantId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
