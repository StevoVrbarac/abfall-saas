'use client';

import { useState, useEffect, useCallback } from 'react';

interface ReportData {
  byAvv: { avv_code: string; bezeichnung: string; anzahl: number; menge_kg: number }[];
  byStatus: { status: string; anzahl: number; menge_kg: number }[];
  byMonth: { monat: string; anzahl: number; menge_kg: number }[];
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  offen:        { label: 'Offen',        cls: 'bg-amber-100 text-amber-700' },
  in_entsorgung:{ label: 'In Entsorgung',cls: 'bg-blue-100 text-blue-700' },
  entsorgt:     { label: 'Entsorgt',     cls: 'bg-green-100 text-green-700' },
  archiviert:   { label: 'Archiviert',   cls: 'bg-slate-100 text-slate-600' },
};

function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 })} t`;
  return `${kg.toLocaleString('de-DE', { maximumFractionDigits: 1 })} kg`;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mär', '04': 'Apr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Dez',
};

export default function BerichtePage() {
  const now = new Date();
  const defaultVon = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const defaultBis = now.toISOString().slice(0, 10);

  const [von, setVon] = useState(defaultVon);
  const [bis, setBis] = useState(defaultBis);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (von) params.set('von', von);
    if (bis) params.set('bis', bis);
    fetch(`/api/berichte?${params}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [von, bis]);

  useEffect(() => { load(); }, [load]);

  const totalMenge = data?.byStatus.reduce((s, r) => s + r.menge_kg, 0) ?? 0;
  const totalAnzahl = data?.byStatus.reduce((s, r) => s + r.anzahl, 0) ?? 0;
  const maxMonthMenge = Math.max(...(data?.byMonth.map(m => m.menge_kg) ?? [1]), 1);

  function exportCsv() {
    const params = new URLSearchParams();
    if (von) params.set('von', von);
    if (bis) params.set('bis', bis);
    window.location.href = `/api/berichte/export?${params}`;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Berichte & Auswertungen</h1>
          <p className="text-slate-500 mt-0.5">Analyse Ihrer Abfalldaten</p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CSV exportieren
        </button>
      </div>

      {/* Date filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Von</label>
          <input type="date" value={von} onChange={e => setVon(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Bis</label>
          <input type="date" value={bis} onChange={e => setBis(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Dieses Jahr', von: `${now.getFullYear()}-01-01`, bis: defaultBis },
            { label: 'Letztes Jahr', von: `${now.getFullYear() - 1}-01-01`, bis: `${now.getFullYear() - 1}-12-31` },
            { label: 'Letzte 6 Monate', von: new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().slice(0, 10), bis: defaultBis },
          ].map(preset => (
            <button key={preset.label} onClick={() => { setVon(preset.von); setBis(preset.bis); }}
              className="px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition">
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-400">Lade Daten…</div>
      ) : !data ? null : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Einträge gesamt', value: totalAnzahl.toString(), color: 'bg-blue-500' },
              { label: 'Gesamtmenge', value: formatKg(totalMenge), color: 'bg-green-600' },
              { label: 'Abfallarten (AVV)', value: data.byAvv.length.toString(), color: 'bg-purple-500' },
              { label: 'Entsorgt', value: (data.byStatus.find(s => s.status === 'entsorgt')?.anzahl ?? 0).toString(), color: 'bg-teal-600' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                <div className={`${kpi.color} w-10 h-10 rounded-xl shrink-0`} />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Monatliche Abfallmengen</h2>
              {data.byMonth.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Keine Daten im Zeitraum</div>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {data.byMonth.map(m => {
                    const [, month] = m.monat.split('-');
                    const height = Math.max((m.menge_kg / maxMonthMenge) * 100, 3);
                    return (
                      <div key={m.monat} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                        <div className="text-xs text-slate-500 truncate w-full text-center">{formatKg(m.menge_kg)}</div>
                        <div className="w-full bg-green-500 rounded-t transition-all" style={{ height: `${height}%` }} />
                        <div className="text-xs text-slate-400">{MONTH_NAMES[month]}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Nach Status</h2>
              <div className="space-y-3">
                {data.byStatus.map(s => {
                  const st = STATUS_LABELS[s.status] ?? { label: s.status, cls: 'bg-slate-100 text-slate-600' };
                  const pct = totalAnzahl > 0 ? Math.round((s.anzahl / totalAnzahl) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                        <span className="text-slate-600 text-xs">{s.anzahl} · {formatKg(s.menge_kg)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {data.byStatus.length === 0 && (
                  <p className="text-sm text-slate-400">Keine Daten</p>
                )}
              </div>
            </div>
          </div>

          {/* By AVV table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Aufschlüsselung nach AVV-Code</h2>
            </div>
            {data.byAvv.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Keine Daten im ausgewählten Zeitraum</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">AVV-Code</th>
                    <th className="text-left px-5 py-3 font-semibold text-slate-600">Bezeichnung</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-600">Einträge</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-600">Menge</th>
                    <th className="text-right px-5 py-3 font-semibold text-slate-600">Anteil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.byAvv.map(row => {
                    const pct = totalMenge > 0 ? (row.menge_kg / totalMenge) * 100 : 0;
                    return (
                      <tr key={row.avv_code} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs text-slate-700">{row.avv_code}</td>
                        <td className="px-5 py-3 text-slate-700 max-w-[250px] truncate">{row.bezeichnung}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{row.anzahl}</td>
                        <td className="px-5 py-3 text-right text-slate-700 font-medium">{formatKg(row.menge_kg)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right">{pct.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-slate-700">Gesamt</td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">{totalAnzahl}</td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-slate-700">{formatKg(totalMenge)}</td>
                    <td className="px-5 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
