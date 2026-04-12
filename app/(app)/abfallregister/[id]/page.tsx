'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface AbfallEintrag {
  id: string;
  avv_code: string;
  bezeichnung: string;
  menge: number;
  einheit: string;
  erzeugungsdatum: string;
  erzeuger_standort?: string;
  entsorgungsweg?: string;
  entsorger_name?: string;
  status: string;
  notizen?: string;
  created_at: string;
  updated_at: string;
}

const EINHEITEN = ['kg', 't', 'Liter', 'Stück'];
const STATUS_OPTIONS = [
  { value: 'offen', label: 'Offen' },
  { value: 'in_entsorgung', label: 'In Entsorgung' },
  { value: 'entsorgt', label: 'Entsorgt' },
  { value: 'archiviert', label: 'Archiviert' },
];
const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  offen:        { label: 'Offen',        cls: 'bg-amber-100 text-amber-700' },
  in_entsorgung:{ label: 'In Entsorgung',cls: 'bg-blue-100 text-blue-700' },
  entsorgt:     { label: 'Entsorgt',     cls: 'bg-green-100 text-green-700' },
  archiviert:   { label: 'Archiviert',   cls: 'bg-slate-100 text-slate-600' },
};

export default function AbfallEintragPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [eintrag, setEintrag] = useState<AbfallEintrag | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<Partial<AbfallEintrag>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/abfallregister/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) { setEintrag(d); setForm(d); }
        else router.replace('/abfallregister');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  function setField(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/abfallregister/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, menge: parseFloat(String(form.menge)) }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const updated = await fetch(`/api/abfallregister/${id}`).then(r => r.json());
      setEintrag(updated);
      setForm(updated);
      setEdit(false);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Eintrag archivieren?')) return;
    await fetch(`/api/abfallregister/${id}`, { method: 'DELETE' });
    router.push('/abfallregister');
  }

  if (loading) {
    return <div className="p-10 text-center text-slate-400">Lade…</div>;
  }
  if (!eintrag) return null;

  const st = STATUS_LABELS[eintrag.status] ?? { label: eintrag.status, cls: 'bg-slate-100 text-slate-600' };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/abfallregister" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-mono">{eintrag.avv_code}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{eintrag.bezeichnung}</p>
        </div>
        {!edit && (
          <div className="flex gap-2">
            <button
              onClick={() => setEdit(true)}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              Bearbeiten
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
            >
              Archivieren
            </button>
          </div>
        )}
      </div>

      {edit ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-5 space-y-4">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Abfallinformationen bearbeiten</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">AVV-Code *</label>
                <input required type="text" value={form.avv_code || ''} onChange={e => setField('avv_code', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Erzeugungsdatum *</label>
                <input required type="date" value={form.erzeugungsdatum || ''} onChange={e => setField('erzeugungsdatum', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bezeichnung *</label>
              <input required type="text" value={form.bezeichnung || ''} onChange={e => setField('bezeichnung', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Menge *</label>
                <input required type="number" min="0" step="0.01" value={form.menge ?? ''} onChange={e => setField('menge', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Einheit</label>
                <select value={form.einheit || 'kg'} onChange={e => setField('einheit', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {EINHEITEN.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status || 'offen'} onChange={e => setField('status', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Erzeuger-Standort</label>
                <input type="text" value={form.erzeuger_standort || ''} onChange={e => setField('erzeuger_standort', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entsorgungsweg</label>
                <input type="text" value={form.entsorgungsweg || ''} onChange={e => setField('entsorgungsweg', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entsorger</label>
                <input type="text" value={form.entsorger_name || ''} onChange={e => setField('entsorger_name', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
              <textarea value={form.notizen || ''} onChange={e => setField('notizen', e.target.value)} rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            </div>
          </div>

          <div className="p-5 flex items-center justify-between">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={() => { setEdit(false); setForm(eintrag); }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
                Abbrechen
              </button>
              <button type="submit" disabled={saving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
                {saving ? 'Speichern…' : 'Änderungen speichern'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
            <Field label="AVV-Code" value={<span className="font-mono">{eintrag.avv_code}</span>} />
            <Field label="Erzeugungsdatum" value={new Date(eintrag.erzeugungsdatum).toLocaleDateString('de-DE')} />
            <Field label="Bezeichnung" value={eintrag.bezeichnung} />
            <Field label="Menge" value={`${eintrag.menge.toLocaleString('de-DE')} ${eintrag.einheit}`} />
            <Field label="Erzeuger-Standort" value={eintrag.erzeuger_standort} />
            <Field label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>} />
            <Field label="Entsorgungsweg" value={eintrag.entsorgungsweg} />
            <Field label="Entsorger" value={eintrag.entsorger_name} />
          </div>
          {eintrag.notizen && (
            <div className="p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Notizen</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{eintrag.notizen}</p>
            </div>
          )}
          <div className="p-5 flex gap-6 text-xs text-slate-400">
            <span>Erstellt: {new Date(eintrag.created_at).toLocaleString('de-DE')}</span>
            <span>Geändert: {new Date(eintrag.updated_at).toLocaleString('de-DE')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">{label}</p>
      <p className="text-sm text-slate-800">{value || <span className="text-slate-300">—</span>}</p>
    </div>
  );
}
