'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EINHEITEN = ['kg', 't', 'Liter', 'Stück'];
const STATUS_OPTIONS = [
  { value: 'offen', label: 'Offen' },
  { value: 'in_entsorgung', label: 'In Entsorgung' },
  { value: 'entsorgt', label: 'Entsorgt' },
];

export default function NeuerAbfalleintragPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    avv_code: '',
    bezeichnung: '',
    menge: '',
    einheit: 'kg',
    erzeugungsdatum: new Date().toISOString().slice(0, 10),
    erzeuger_standort: '',
    entsorgungsweg: '',
    entsorger_name: '',
    status: 'offen',
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
      const res = await fetch('/api/abfallregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, menge: parseFloat(form.menge) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Fehler beim Speichern'); return; }
      router.push(`/abfallregister/${data.id}`);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/abfallregister" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Neuer Abfalleintrag</h1>
          <p className="text-slate-500 text-sm mt-0.5">Abfall im Register erfassen</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Abfallinformationen</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">AVV-Code *</label>
              <input
                required
                type="text"
                value={form.avv_code}
                onChange={e => set('avv_code', e.target.value)}
                placeholder="z.B. 20 01 01"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Menge *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.menge}
                  onChange={e => set('menge', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-slate-700 mb-1">Einheit</label>
                <select
                  value={form.einheit}
                  onChange={e => set('einheit', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {EINHEITEN.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bezeichnung *</label>
            <input
              required
              type="text"
              value={form.bezeichnung}
              onChange={e => set('bezeichnung', e.target.value)}
              placeholder="z.B. Papier und Pappe"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Erzeugungsdatum *</label>
              <input
                required
                type="date"
                value={form.erzeugungsdatum}
                onChange={e => set('erzeugungsdatum', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Erzeuger-Standort</label>
            <input
              type="text"
              value={form.erzeuger_standort}
              onChange={e => set('erzeuger_standort', e.target.value)}
              placeholder="z.B. Halle 3, Produktionslinie A"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Entsorgung</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entsorgungsweg</label>
              <input
                type="text"
                value={form.entsorgungsweg}
                onChange={e => set('entsorgungsweg', e.target.value)}
                placeholder="z.B. Verwertung, Beseitigung"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entsorger</label>
              <input
                type="text"
                value={form.entsorger_name}
                onChange={e => set('entsorger_name', e.target.value)}
                placeholder="Name des Entsorgungsunternehmens"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
            <textarea
              value={form.notizen}
              onChange={e => set('notizen', e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>

        <div className="p-5 flex items-center justify-between">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <Link href="/abfallregister"
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition"
            >
              {saving ? 'Speichern…' : 'Eintrag speichern'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
