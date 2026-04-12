'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NeuerMieterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    address: '',
    postal_code: '',
    city: '',
    kontakt_email: '',
    kontakt_telefon: '',
    entsorgernummer: '',
    vat_id: '',
  });
  const [adminForm, setAdminForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [withAdmin, setWithAdmin] = useState(true);

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }
  function setAdmin(field: string, value: string) { setAdminForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        ...(withAdmin && adminForm.email ? {
          admin_first_name: adminForm.first_name,
          admin_last_name: adminForm.last_name,
          admin_email: adminForm.email,
          admin_password: adminForm.password,
        } : {}),
      };
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Fehler beim Anlegen'); return; }
      router.push(`/admin/mieter/${data.id}`);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/mieter" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Neuer Mandant</h1>
          <p className="text-slate-500 text-sm mt-0.5">Neues Unternehmen im System registrieren</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {/* Company info */}
        <div className="p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Firmendaten</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname *</label>
            <input required type="text" value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
              <input type="text" value={form.postal_code} onChange={e => set('postal_code', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ort</label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <input type="email" value={form.kontakt_email} onChange={e => set('kontakt_email', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
              <input type="text" value={form.kontakt_telefon} onChange={e => set('kontakt_telefon', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entsorgernummer</label>
              <input type="text" value={form.entsorgernummer} onChange={e => set('entsorgernummer', e.target.value)}
                placeholder="z.B. DE-12345-Z"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">USt-IdNr.</label>
              <input type="text" value={form.vat_id} onChange={e => set('vat_id', e.target.value)}
                placeholder="DE123456789"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
            </div>
          </div>
        </div>

        {/* Admin user */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Admin-Benutzer erstellen</h2>
            <button type="button" onClick={() => setWithAdmin(w => !w)}
              className={`text-xs px-3 py-1 rounded-full transition ${withAdmin ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
              {withAdmin ? 'Ja' : 'Nein'}
            </button>
          </div>

          {withAdmin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
                  <input type="text" value={adminForm.first_name} onChange={e => setAdmin('first_name', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
                  <input type="text" value={adminForm.last_name} onChange={e => setAdmin('last_name', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail *</label>
                <input type="email" value={adminForm.email} onChange={e => setAdmin('email', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passwort *</label>
                <input type="password" value={adminForm.password} onChange={e => setAdmin('password', e.target.value)}
                  minLength={8} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <p className="text-xs text-slate-400 mt-1">Mindestens 8 Zeichen</p>
              </div>
            </>
          )}
        </div>

        <div className="p-5 flex items-center justify-between">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 ml-auto">
            <Link href="/admin/mieter" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">
              Abbrechen
            </Link>
            <button type="submit" disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
              {saving ? 'Anlegen…' : 'Mandant anlegen'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
