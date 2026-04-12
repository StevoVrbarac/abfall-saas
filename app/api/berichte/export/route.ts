import { NextRequest, NextResponse } from 'next/server';
import { getReportData } from '@/lib/db';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || '';
  const { searchParams } = new URL(request.url);

  const von = searchParams.get('von') || undefined;
  const bis = searchParams.get('bis') || undefined;

  const { rawEntries } = getReportData(tenantId, von, bis);

  const header = ['ID', 'AVV-Code', 'Bezeichnung', 'Menge', 'Einheit', 'Erzeugungsdatum', 'Erzeuger-Standort', 'Entsorgungsweg', 'Entsorger', 'Status', 'Notizen', 'Erstellt am'];
  const rows = rawEntries.map(e => [
    e.id,
    e.avv_code,
    `"${(e.bezeichnung || '').replace(/"/g, '""')}"`,
    e.menge,
    e.einheit,
    e.erzeugungsdatum,
    `"${(e.erzeuger_standort || '').replace(/"/g, '""')}"`,
    `"${(e.entsorgungsweg || '').replace(/"/g, '""')}"`,
    `"${(e.entsorger_name || '').replace(/"/g, '""')}"`,
    e.status,
    `"${(e.notizen || '').replace(/"/g, '""')}"`,
    e.created_at,
  ]);

  const csv = [header.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const filename = `abfallregister_${von || 'alle'}_${bis || 'alle'}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
