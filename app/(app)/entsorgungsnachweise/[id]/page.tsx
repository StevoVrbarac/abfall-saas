'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Nachweis {
  id: string;
  nachweis_nummer: string;
  nachweis_typ: string;
  avv_code?: string;
  abfall_bezeichnung: string;
  menge?: number;
  einheit?: string;
  erzeuger_name: string;
  entsorger_name: string;
  entsorger_genehmigung?: string;
  befoerderer_name?: string;
  entsorgungsanlage?: string;
  ausstellungsdatum: string;
  gueltig_bis?: string;
  status: string;
  notizen?: string;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  aktiv:      { label: 'Aktiv',      cls: 'bg-green-100 text-green-700' },
  abgelaufen: { label: 'Abgelaufen', cls: 'bg-red-100 text-red-700' },
  widerrufen: { label: 'Widerrufen', cls: 'bg-orange-100 text-orange-700' },
  archiviert: { label: 'Archiviert', cls: 'bg-slate-100 text-slate-600' },
};

const TYPEN = ['Entsorgungsnachweis', 'Sammelentsorgungsnachweis', 'Übernahmeschein', 'Begleitschein', 'Sonstige'];
const EINHEITEN = ['kg', 't', 'Liter', 'Stück'];

interface NachweisForm extends Omit<Partial<Nachweis>, 'menge'> {
  menge?: string;
}

export default function NachweisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [nachweis, setNachweis] = useState<Nachweis | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<NachweisForm>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/entsorgungsnachweise/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) { setNachweis(d); setForm({ ...d, menge: d.menge?.toString() || '' }); }
        else router.replace('/entsorgungsnachweise');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        menge: form.menge ? parseFloat(form.menge) : undefined,
        gueltig_bis: form.gueltig_bis || undefined,
        avv_code: form.avv_code || undefined,
      };
      const res = await fetch(`/api/entsorgungsnachweise/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      const updated = await fetch(`/api/entsorgungsnachweise/${id}`).then(r => r.json());
      setNachweis(updated);
      setForm({ ...updated, menge: updated.menge?.toString() || '' });
      setEdit(false);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Lade…</div>;
  if (!nachweis) return null;

  const st = STATUS_LABELS[nachweis.status] ?? { label: nachweis.status, cls: 'bg-slate-100 text-slate-600' };
  const isExpiringSoon = nachweis.gueltig_bis && nachweis.status === 'aktiv' &&
    new Date(nachweis.gueltig_bis).getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000 &&
    new Date(nachweis.gueltig_bis).getTime() > Date.now();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/entsorgungsnachweise" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 font-mono">{nachweis.nachweis_nummer}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{nachweis.nachweis_typ} · {nachweis.abfall_bezeichnung}</p>
        </div>
        {!edit && (
          <button onClick={() => setEdit(true)}
            className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition">
            Bearbeiten
          </button>
        )}
      </div>

      {isExpiringSoon && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800 text-sm">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Dieser Nachweis läuft am {new Date(nachweis.gueltig_bis!).toLocaleDateString('de-DE')} ab.</span>
        </div>
      )}

      {edit ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-5 space-y-4">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Bearbeiten</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nachweis-Nr. *</label>
                <input required type="text" value={form.nachweis_nummer || ''} onChange={e => setField('nachweis_nummer', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Typ</label>
                <select value={form.nachweis_typ || ''} onChange={e => setField('nachweis_typ', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ausgestellt *</label>
                <input required type="date" value={form.ausstellungsdatum || ''} onChange={e => setField('ausstellungsdatum', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gültig bis</label>
                <input type="date" value={form.gueltig_bis || ''} onChange={e => setField('gueltig_bis', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status || 'aktiv'} onChange={e => setField('status', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="aktiv">Aktiv</option>
                  <option value="abgelaufen">Abgelaufen</option>
                  <option value="widerrufen">Widerrufen</option>
                  <option value="archiviert">Archiviert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Abfall-Bezeichnung *</label>
              <input required type="text" value={form.abfall_bezeichnung || ''} onChange={e => setField('abfall_bezeichnung', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">AVV-Code</label>
                <input type="text" value={form.avv_code || ''} onChange={e => setField('avv_code', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Menge</label>
                  <input type="number" min="0" step="0.01" value={form.menge || ''} onChange={e => setField('menge', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="w-20">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Einheit</label>
                  <select value={form.einheit || 'kg'} onChange={e => setField('einheit', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    {EINHEITEN.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Erzeuger *</label>
                <input required type="text" value={form.erzeuger_name || ''} onChange={e => setField('erzeuger_name', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entsorger *</label>
                <input required type="text" value={form.entsorger_name || ''} onChange={e => setField('entsorger_name', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entsorger-Genehmigung</label>
                <input type="text" value={form.entsorger_genehmigung || ''} onChange={e => setField('entsorger_genehmigung', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beförderer</label>
                <input type="text" value={form.befoerderer_name || ''} onChange={e => setField('befoerderer_name', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entsorgungsanlage</label>
              <input type="text" value={form.entsorgungsanlage || ''} onChange={e => setField('entsorgungsanlage', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
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
              <button type="button" onClick={() => { setEdit(false); setForm({ ...nachweis, menge: nachweis.menge?.toString() || '' }); }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Abbrechen</button>
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
            <Field label="Nachweis-Nr." value={<span className="font-mono">{nachweis.nachweis_nummer}</span>} />
            <Field label="Typ" value={nachweis.nachweis_typ} />
            <Field label="Ausgestellt" value={new Date(nachweis.ausstellungsdatum).toLocaleDateString('de-DE')} />
            <Field label="Gültig bis" value={nachweis.gueltig_bis ? new Date(nachweis.gueltig_bis).toLocaleDateString('de-DE') : undefined} />
            <Field label="AVV-Code" value={nachweis.avv_code ? <span className="font-mono">{nachweis.avv_code}</span> : undefined} />
            <Field label="Menge" value={nachweis.menge ? `${nachweis.menge.toLocaleString('de-DE')} ${nachweis.einheit}` : undefined} />
          </div>
          <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Abfall-Bezeichnung" value={nachweis.abfall_bezeichnung} />
            <Field label="Erzeuger" value={nachweis.erzeuger_name} />
            <Field label="Entsorger" value={nachweis.entsorger_name} />
            <Field label="Entsorger-Genehmigung" value={nachweis.entsorger_genehmigung} />
            <Field label="Beförderer" value={nachweis.befoerderer_name} />
            <Field label="Entsorgungsanlage" value={nachweis.entsorgungsanlage} />
          </div>
          {nachweis.notizen && (
            <div className="p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Notizen</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{nachweis.notizen}</p>
            </div>
          )}
          <div className="p-5 flex gap-6 text-xs text-slate-400">
            <span>Erstellt: {new Date(nachweis.created_at).toLocaleString('de-DE')}</span>
            <span>Geändert: {new Date(nachweis.updated_at).toLocaleString('de-DE')}</span>
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
