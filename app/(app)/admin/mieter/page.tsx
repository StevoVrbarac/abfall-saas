import { headers } from 'next/headers';
import { getAllTenants } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MieterListePage() {
  await headers();
  const tenants = getAllTenants();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mandanten</h1>
          <p className="text-slate-500 mt-0.5">{tenants.length} Mandanten registriert</p>
        </div>
        <Link href="/admin/mieter/neu"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neuer Mandant
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {tenants.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-400 text-sm">Noch keine Mandanten angelegt</p>
            <Link href="/admin/mieter/neu" className="mt-3 inline-block text-purple-600 hover:underline text-sm">
              Ersten Mandanten anlegen →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Firma</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Stadt</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Entsorgernr.</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Benutzer</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-600">Einträge</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Erstellt</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{t.name}</p>
                    {t.kontakt_email && <p className="text-xs text-slate-400 mt-0.5">{t.kontakt_email}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {[t.postal_code, t.city].filter(Boolean).join(' ') || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">
                    {t.entsorgernummer || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">{t.user_count ?? 0}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{t.entry_count ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      t.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {new Date(t.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/mieter/${t.id}`}
                      className="text-purple-600 hover:text-purple-800 text-xs font-medium">
                      Verwalten →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
