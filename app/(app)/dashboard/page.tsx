import { headers } from 'next/headers';
import { getDashboardStats, getTenantById } from '@/lib/db';
import Link from 'next/link';

function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} t`;
  return `${kg.toLocaleString('de-DE')} kg`;
}

export default async function DashboardPage() {
  const h = await headers();
  const tenantId = h.get('x-tenant-id') || '';
  const firstName = h.get('x-first-name') || '';

  const stats = getDashboardStats(tenantId);
  const tenant = getTenantById(tenantId);

  const kpis = [
    {
      label: 'Gesamteinträge',
      value: stats.total.toString(),
      sub: 'Aktive Abfalleinträge',
      color: 'bg-blue-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Offene Einträge',
      value: stats.offen.toString(),
      sub: 'Noch nicht entsorgt',
      color: stats.offen > 0 ? 'bg-amber-500' : 'bg-green-500',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Gesamtmenge',
      value: formatKg(stats.gesamtMenge),
      sub: 'Erfasste Abfallmenge',
      color: 'bg-green-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      label: 'Aktive Nachweise',
      value: stats.aktiveNachweise.toString(),
      sub: stats.ablaufendeNachweise > 0 ? `${stats.ablaufendeNachweise} laufen bald ab` : 'Alle aktuell',
      color: stats.ablaufendeNachweise > 0 ? 'bg-orange-500' : 'bg-teal-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  const monthNames: Record<string, string> = { '01': 'Jan', '02': 'Feb', '03': 'Mär', '04': 'Apr', '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Dez' };
  const maxMenge = Math.max(...stats.monatlich.map(m => m.menge_kg), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Willkommen, {firstName}!
          </h1>
          <p className="text-slate-500 mt-0.5">{tenant?.name} · Abfallmanagement Dashboard</p>
        </div>
        <Link
          href="/abfallregister/neu"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neuer Eintrag
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
            <div className={`${kpi.color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
              {kpi.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-sm font-medium text-slate-700">{kpi.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Abfallmengen (letzte 6 Monate)</h2>
          {stats.monatlich.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Keine Daten vorhanden</div>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {stats.monatlich.map(m => {
                const [year, month] = m.monat.split('-');
                const height = Math.max((m.menge_kg / maxMenge) * 100, 4);
                return (
                  <div key={m.monat} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-slate-500">{formatKg(m.menge_kg)}</div>
                    <div
                      className="w-full bg-green-500 rounded-t-md transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-slate-400">{monthNames[month]}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Status-Übersicht</h2>
          <div className="space-y-3">
            {[
              { label: 'Entsorgt', count: stats.entsorgt, color: 'bg-green-100 text-green-700' },
              { label: 'In Entsorgung', count: stats.total - stats.entsorgt - stats.offen, color: 'bg-blue-100 text-blue-700' },
              { label: 'Offen', count: stats.offen, color: 'bg-amber-100 text-amber-700' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{s.label}</span>
                <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${s.color}`}>{s.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Compliance-Status</h3>
            {stats.ablaufendeNachweise > 0 ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{stats.ablaufendeNachweise} Nachweis(e) laufen in 60 Tagen ab</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-800 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Alle Nachweise aktuell</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/abfallregister/neu', label: 'Neuen Abfall erfassen', desc: 'Eintrag im Abfallregister anlegen', color: 'border-green-200 hover:border-green-300' },
          { href: '/entsorgungsnachweise/neu', label: 'Nachweis hinzufügen', desc: 'Entsorgungsnachweis erfassen', color: 'border-blue-200 hover:border-blue-300' },
          { href: '/berichte', label: 'Bericht erstellen', desc: 'Auswertungen und Exporte', color: 'border-purple-200 hover:border-purple-300' },
        ].map(q => (
          <Link key={q.href} href={q.href} className={`bg-white rounded-xl border-2 ${q.color} p-4 transition group`}>
            <p className="font-semibold text-slate-800 group-hover:text-green-700 transition">{q.label}</p>
            <p className="text-sm text-slate-500 mt-0.5">{q.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
