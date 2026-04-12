'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Nachweis {
  id: string;
  nachweis_nummer: string;
  nachweis_typ: string;
  abfall_bezeichnung: string;
  entsorger_name: string;
  ausstellungsdatum: string;
  gueltig_bis?: string;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  aktiv:      { label: 'Aktiv',      cls: 'bg-green-100 text-green-700' },
  abgelaufen: { label: 'Abgelaufen', cls: 'bg-red-100 text-red-700' },
  widerrufen: { label: 'Widerrufen', cls: 'bg-orange-100 text-orange-700' },
  archiviert: { label: 'Archiviert', cls: 'bg-slate-100 text-slate-600' },
};

export default function EntsorgungsnachweisePage() {
  const [items, setItems] = useState<Nachweis[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const LIMIT = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', page.toString());
    params.set('limit', LIMIT.toString());

    fetch(`/api/entsorgungsnachweise?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / LIMIT);

  function isExpiringSoon(gueltigBis?: string) {
    if (!gueltigBis) return false;
    const diff = new Date(gueltigBis).getTime() - Date.now();
    return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Entsorgungsnachweise</h1>
          <p className="text-slate-500 mt-0.5">{total} Nachweise gesamt</p>
        </div>
        <Link
          href="/entsorgungsnachweise/neu"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neuer Nachweis
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 flex-wrap items-center">
        <span className="text-sm text-slate-500 font-medium">Status:</span>
        {['', 'aktiv', 'abgelaufen', 'widerrufen', 'archiviert'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              statusFilter === s
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === '' ? 'Alle' : STATUS_LABELS[s]?.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Lade Daten…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-400 text-sm">Keine Nachweise gefunden</p>
            <Link href="/entsorgungsnachweise/neu" className="mt-3 inline-block text-green-600 hover:underline text-sm">
              Ersten Nachweis anlegen →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Nachweis-Nr.</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Typ</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Abfallbezeichnung</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Entsorger</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ausgestellt</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Gültig bis</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => {
                const st = STATUS_LABELS[item.status] ?? { label: item.status, cls: 'bg-slate-100 text-slate-600' };
                const expiring = item.status === 'aktiv' && isExpiringSoon(item.gueltig_bis);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{item.nachweis_nummer}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{item.nachweis_typ}</td>
                    <td className="px-4 py-3 text-slate-800 max-w-[180px] truncate">{item.abfall_bezeichnung}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate">{item.entsorger_name}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(item.ausstellungsdatum).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.gueltig_bis ? (
                        <span className={expiring ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                          {expiring && '⚠ '}
                          {new Date(item.gueltig_bis).toLocaleDateString('de-DE')}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/entsorgungsnachweise/${item.id}`}
                        className="text-green-600 hover:text-green-800 text-xs font-medium">
                        Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Seite {page} von {totalPages} · {total} Nachweise
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition">
                ← Zurück
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition">
                Weiter →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
