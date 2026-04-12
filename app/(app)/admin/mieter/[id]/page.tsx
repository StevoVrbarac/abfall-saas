'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  kontakt_email?: string;
  kontakt_telefon?: string;
  entsorgernummer?: string;
  vat_id?: string;
  is_active: number;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: number;
  last_login?: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  tenant_admin: 'Firmen-Admin',
  tenant_user: 'Benutzer',
};

export default function MieterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTenant, setEditTenant] = useState(false);
  const [form, setForm] = useState<Partial<Tenant>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // New user form
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'tenant_user' });
  const [userSaving, setUserSaving] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/tenants/${id}`).then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ]).then(([t, allUsers]) => {
      setTenant(t);
      setForm(t);
      setUsers((allUsers as (User & { tenant_id: string })[]).filter(u => u.tenant_id === id));
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  function setField(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function saveTenant(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tenants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setMsg({ type: 'err', text: d.error }); return; }
      setMsg({ type: 'ok', text: 'Gespeichert' });
      const updated = await fetch(`/api/admin/tenants/${id}`).then(r => r.json());
      setTenant(updated);
      setForm(updated);
      setEditTenant(false);
    } catch {
      setMsg({ type: 'err', text: 'Netzwerkfehler' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleTenantStatus() {
    const newStatus = tenant!.is_active ? 0 : 1;
    await fetch(`/api/admin/tenants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tenant, is_active: newStatus }),
    });
    loadData();
  }

  async function toggleUserStatus(userId: string, active: number) {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: active ? 'deactivate' : 'activate' }),
    });
    loadData();
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setUserMsg(null);
    setUserSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userForm, tenant_id: id }),
      });
      const d = await res.json();
      if (!res.ok) { setUserMsg({ type: 'err', text: d.error }); return; }
      setUserMsg({ type: 'ok', text: 'Benutzer angelegt' });
      setUserForm({ first_name: '', last_name: '', email: '', password: '', role: 'tenant_user' });
      setShowUserForm(false);
      loadData();
    } catch {
      setUserMsg({ type: 'err', text: 'Netzwerkfehler' });
    } finally {
      setUserSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Lade…</div>;
  if (!tenant) return <div className="p-10 text-center text-slate-400">Mandant nicht gefunden</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/mieter" className="text-slate-400 hover:text-slate-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{tenant.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tenant.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {tenant.is_active ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Erstellt: {new Date(tenant.created_at).toLocaleDateString('de-DE')}</p>
        </div>
        <div className="flex gap-2">
          {!editTenant && (
            <button onClick={() => setEditTenant(true)}
              className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition">
              Bearbeiten
            </button>
          )}
          <button onClick={toggleTenantStatus}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${tenant.is_active ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}>
            {tenant.is_active ? 'Deaktivieren' : 'Aktivieren'}
          </button>
        </div>
      </div>

      {/* Tenant form / detail */}
      {editTenant ? (
        <form onSubmit={saveTenant} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="p-5 space-y-4">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Firmendaten bearbeiten</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname *</label>
              <input required type="text" value={form.name || ''} onChange={e => setField('name', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
              <input type="text" value={form.address || ''} onChange={e => setField('address', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PLZ</label>
                <input type="text" value={form.postal_code || ''} onChange={e => setField('postal_code', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Ort</label>
                <input type="text" value={form.city || ''} onChange={e => setField('city', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
                <input type="email" value={form.kontakt_email || ''} onChange={e => setField('kontakt_email', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                <input type="text" value={form.kontakt_telefon || ''} onChange={e => setField('kontakt_telefon', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entsorgernummer</label>
                <input type="text" value={form.entsorgernummer || ''} onChange={e => setField('entsorgernummer', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">USt-IdNr.</label>
                <input type="text" value={form.vat_id || ''} onChange={e => setField('vat_id', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono" />
              </div>
            </div>
          </div>
          <div className="p-5 flex items-center justify-between">
            {msg && <p className={`text-sm ${msg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={() => { setEditTenant(false); setForm(tenant); }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition">Abbrechen</button>
              <button type="submit" disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
                {saving ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {[
            { label: 'Firmenname', value: tenant.name },
            { label: 'Adresse', value: tenant.address },
            { label: 'PLZ / Ort', value: [tenant.postal_code, tenant.city].filter(Boolean).join(' ') },
            { label: 'E-Mail', value: tenant.kontakt_email },
            { label: 'Telefon', value: tenant.kontakt_telefon },
            { label: 'Entsorgernummer', value: tenant.entsorgernummer },
            { label: 'USt-IdNr.', value: tenant.vat_id },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">{f.label}</p>
              <p className="text-slate-700">{f.value || <span className="text-slate-300">—</span>}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Benutzer ({users.length})</h2>
          <button onClick={() => setShowUserForm(u => !u)}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition">
            + Benutzer
          </button>
        </div>

        {showUserForm && (
          <form onSubmit={createUser} className="p-5 border-b border-slate-100 bg-purple-50/30 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Neuen Benutzer anlegen</h3>
            <div className="grid grid-cols-2 gap-3">
              <input required type="text" placeholder="Vorname" value={userForm.first_name}
                onChange={e => setUserForm(f => ({ ...f, first_name: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input required type="text" placeholder="Nachname" value={userForm.last_name}
                onChange={e => setUserForm(f => ({ ...f, last_name: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input required type="email" placeholder="E-Mail" value={userForm.email}
                onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input required type="password" placeholder="Passwort (min. 8 Zeichen)" value={userForm.password}
                minLength={8}
                onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex items-center gap-3">
              <select value={userForm.role} onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="tenant_user">Benutzer</option>
                <option value="tenant_admin">Firmen-Admin</option>
              </select>
              {userMsg && (
                <p className={`text-sm ${userMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{userMsg.text}</p>
              )}
              <div className="flex gap-2 ml-auto">
                <button type="button" onClick={() => { setShowUserForm(false); setUserMsg(null); }}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition">Abbrechen</button>
                <button type="submit" disabled={userSaving}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition">
                  {userSaving ? 'Anlegen…' : 'Anlegen'}
                </button>
              </div>
            </div>
          </form>
        )}

        {users.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Keine Benutzer vorhanden</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">E-Mail</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Rolle</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Letzter Login</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.first_name} {u.last_name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {u.last_login ? new Date(u.last_login).toLocaleString('de-DE') : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleUserStatus(u.id, u.is_active)}
                      className={`text-xs px-2 py-1 rounded transition ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                      {u.is_active ? 'Sperren' : 'Freischalten'}
                    </button>
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
