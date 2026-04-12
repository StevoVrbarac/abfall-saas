import { headers } from 'next/headers';
import { getAdminStats, getAllTenants } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await headers(); // ensure auth headers are available
  const stats = getAdminStats();
  const tenants = getAllTenants();

  const recentTenants = tenants.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System-Übersicht</h1>
        <p className="text-slate-500 mt-0.5">AbfallManager SaaS · Administrator-Bereich</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Aktive Mandanten', value: stats.tenants, color: 'bg-purple-500', href: '/admin/mieter' },
          { label: 'Benutzer gesamt', value: stats.users, color: 'bg-blue-500', href: '/admin/mieter' },
          { label: 'Abfalleinträge', value: stats.eintraege, color: 'bg-green-600', href: null },
          { label: 'Entsorgungsnachweise', value: stats.nachweise, color: 'bg-teal-600', href: null },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`${kpi.color} w-11 h-11 rounded-xl shrink-0`} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value.toLocaleString('de-DE')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tenants */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Mandanten</h2>
            <Link href="/admin/mieter/neu"
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition">
              + Neu
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Firma</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Benutzer</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Einträge</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-[150px]">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.city}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-600">{t.user_count ?? 0}</td>
                  <td className="px-5 py-3 text-right text-slate-600">{t.entry_count ?? 0}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/mieter/${t.id}`}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenants.length > 5 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <Link href="/admin/mieter" className="text-sm text-purple-600 hover:underline">
                Alle {tenants.length} Mandanten ansehen →
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Schnellaktionen</h2>
            <div className="space-y-2">
              {[
                { href: '/admin/mieter/neu', label: 'Neuen Mandanten anlegen', desc: 'Firma + Admin-User erstellen', color: 'text-purple-600 bg-purple-50' },
                { href: '/admin/mieter', label: 'Alle Mandanten verwalten', desc: 'Benutzer, Status, Daten', color: 'text-blue-600 bg-blue-50' },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className={`flex items-center justify-between p-3 rounded-xl ${a.color} hover:opacity-80 transition`}>
                  <div>
                    <p className="font-medium text-sm">{a.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{a.desc}</p>
                  </div>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* System info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">System</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Datenbank</span>
                <span className="text-slate-700 font-medium">SQLite (WAL)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Auth</span>
                <span className="text-slate-700 font-medium">JWT (8h)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Version</span>
                <span className="text-slate-700 font-medium">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
