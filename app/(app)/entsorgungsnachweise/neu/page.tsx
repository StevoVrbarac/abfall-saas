'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TYPEN = ['Entsorgungsnachweis', 'Sammelentsorgungsnachweis', 'Übernahmeschein', 'Begleitschein', 'Sonstige'];
const EINHEITEN = ['kg', 't', 'Liter', 'Stück'];

export default function NeuerNachweisPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nachweis_nummer: '',
    nachweis_typ: 'Entsorgungsnachweis',
    avv_code: '',
    abfall_bezeichnung: '',
    menge: '',
    einheit: 'kg',
    erzeuger_name: '',
    entsorger_name: '',
    entsorger_genehmigung: '',
    befoerderer_name: '',
    entsorgungsanlage: '',
    ausstellungsdatum: new Date().toISOString().slice(0, 10),
    gueltig_bis: '',
    status: 'aktiv',
    notizen: '',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        menge: form.menge ? parseFloat(form.menge) : undefined,
        gueltig_bis: form.gueltig_bis || undefined,
        avv_code: form.avv_code || undefined,
        einheit: form.einheit || undefined,
      };
      const res = await fetch('/api/entsorgungsnachweise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Fehler beim Speichern'); return; }
      router.push(`/entsorgungsnachweise/${data.id}`);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/entsorgungsnachweise" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Neuer Entsorgungsnachweis</h1>
          <p className="text-slate-500 text-sm mt-0.5">Nachweis anlegen und verwalten</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {/* Nachweis-Grunddaten */}
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Nachweis-Grunddaten</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nachweis-Nr. *</label>
              <input required type="text" value={form.nachweis_nummer} onChange={e => set('nachweis_nummer', e.target.value)}
                placeholder="z.B. EN-2024-001"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nachweis-Typ</label>
              <select value={form.nachweis_typ} onChange={e => set('nachweis_typ', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                {TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ausstellungsdatum *</label>
              <input required type="date" value={form.ausstellungsdatum} onChange={e => set('ausstellungsdatum', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gültig bis</label>
              <input type="date" value={form.gueltig_bis} onChange={e => set('gueltig_bis', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="aktiv">Aktiv</option>
                <option value="abgelaufen">Abgelaufen</option>
                <option value="widerrufen">Widerrufen</option>
                <option value="archiviert">Archiviert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Abfallinformationen */}
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Abfallinformationen</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">AVV-Code</label>
              <input type="text" value={form.avv_code} onChange={e => set('avv_code', e.target.value)}
                placeholder="z.B. 20 01 01"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Menge</label>
                <input type="number" min="0" step="0.01" value={form.menge} onChange={e => set('menge', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-slate-700 mb-1">Einheit</label>
                <select value={form.einheit} onChange={e => set('einheit', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {EINHEITEN.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Abfall-Bezeichnung *</label>
            <input required type="text" value={form.abfall_bezeichnung} onChange={e => set('abfall_bezeichnung', e.target.value)}
              placeholder="z.B. Gemischte Siedlungsabfälle"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>

        {/* Beteiligte */}
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Beteiligte</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Erzeuger *</label>
              <input required type="text" value={form.erzeuger_name} onChange={e => set('erzeuger_name', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entsorger *</label>
              <input required type="text" value={form.entsorger_name} onChange={e => set('entsorger_name', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entsorger-Genehmigung</label>
              <input type="text" value={form.entsorger_genehmigung} onChange={e => set('entsorger_genehmigung', e.target.value)}
                placeholder="Genehmigungsnummer"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Beförderer</label>
              <input type="text" value={form.befoerderer_name} onChange={e => set('befoerderer_name', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Entsorgungsanlage</label>
            <input type="text" value={form.entsorgungsanlage} onChange={e => set('entsorgungsanlage', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
            <textarea value={form.notizen} onChange={e => set('notizen', e.target.value)} rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>
        </div>

        <div className="p-5 flex items-center justify-between">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <Link href="/entsorgungsnachweise"
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
              Abbrechen
            </Link>
            <button type="submit" disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
              {saving ? 'Speichern…' : 'Nachweis speichern'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
