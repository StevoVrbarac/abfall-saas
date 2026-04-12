'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface AbfallEintrag {
  id: string;
  avv_code: string;
  bezeichnung: string;
  menge: number;
  einheit: string;
  erzeugungsdatum: string;
  entsorger_name?: string;
  entsorgungsweg?: string;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  offen:        { label: 'Offen',        cls: 'bg-amber-100 text-amber-700' },
  in_entsorgung:{ label: 'In Entsorgung',cls: 'bg-blue-100 text-blue-700' },
  entsorgt:     { label: 'Entsorgt',     cls: 'bg-green-100 text-green-700' },
  archiviert:   { label: 'Archiviert',   cls: 'bg-slate-100 text-slate-600' },
};

export default function AbfallregisterPage() {
  const [items, setItems] = useState<AbfallEintrag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const LIMIT = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search) params.set('avv', search);
    params.set('page', page.toString());
    params.set('limit', LIMIT.toString());

    fetch(`/api/abfallregister?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [statusFilter, search, page]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleStatusChange(s: string) {
    setStatusFilter(s);
    setPage(1);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Abfallregister</h1>
          <p className="text-slate-500 mt-0.5">{total} Einträge gesamt</p>
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="AVV-Code oder Bezeichnung suchen…"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm transition">Suchen</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="text-slate-400 hover:text-slate-600 px-2 text-lg leading-none">×</button>
          )}
        </form>

        <div className="flex gap-2 flex-wrap">
          {['', 'offen', 'in_entsorgung', 'entsorgt'].map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Lade Daten…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-400 text-sm">Keine Einträge gefunden</p>
            <Link href="/abfallregister/neu" className="mt-3 inline-block text-green-600 hover:underline text-sm">
              Ersten Eintrag anlegen →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">AVV-Code</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Bezeichnung</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Menge</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Datum</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Entsorger</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => {
                const st = STATUS_LABELS[item.status] ?? { label: item.status, cls: 'bg-slate-100 text-slate-600' };
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700 whitespace-nowrap">{item.avv_code}</td>
                    <td className="px-4 py-3 text-slate-800 max-w-[200px] truncate">{item.bezeichnung}</td>
                    <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                      {item.menge.toLocaleString('de-DE')} {item.einheit}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(item.erzeugungsdatum).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate">
                      {item.entsorger_name || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/abfallregister/${item.id}`}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Seite {page} von {totalPages} · {total} Einträge
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                ← Zurück
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Weiter →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
