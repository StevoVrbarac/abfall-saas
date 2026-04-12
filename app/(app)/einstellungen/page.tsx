'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id?: string;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  address?: string;
  postal_code?: string;
  city?: string;
  kontakt_email?: string;
  kontakt_telefon?: string;
  entsorgernummer?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'System-Administrator',
  tenant_admin: 'Firmen-Administrator',
  tenant_user: 'Benutzer',
};

export default function EinstellungenPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password form
  const [pwd, setPwd] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(d => {
        setUser(d);
        setProfile({ first_name: d.firstName || '', last_name: d.lastName || '', email: d.email || '' });
        if (d.tenant) setTenant(d.tenant);
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const res = await fetch('/api/einstellungen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', ...profile }),
      });
      const d = await res.json();
      if (!res.ok) { setProfileMsg({ type: 'err', text: d.error }); return; }
      setProfileMsg({ type: 'ok', text: 'Profil aktualisiert' });
    } catch {
      setProfileMsg({ type: 'err', text: 'Netzwerkfehler' });
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.new_password !== pwd.confirm) {
      setPwdMsg({ type: 'err', text: 'Neue Passwörter stimmen nicht überein' });
      return;
    }
    if (pwd.new_password.length < 8) {
      setPwdMsg({ type: 'err', text: 'Neues Passwort muss mindestens 8 Zeichen haben' });
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch('/api/einstellungen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', old_password: pwd.old_password, new_password: pwd.new_password }),
      });
      const d = await res.json();
      if (!res.ok) { setPwdMsg({ type: 'err', text: d.error }); return; }
      setPwdMsg({ type: 'ok', text: 'Passwort erfolgreich geändert' });
      setPwd({ old_password: '', new_password: '', confirm: '' });
    } catch {
      setPwdMsg({ type: 'err', text: 'Netzwerkfehler' });
    } finally {
      setPwdSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Lade…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>
        <p className="text-slate-500 mt-0.5">Profil und Sicherheitseinstellungen</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-green-700 font-bold text-xl">
            {profile.first_name[0]}{profile.last_name[0]}
          </span>
        </div>
        <div>
          <p className="font-semibold text-slate-900">{profile.first_name} {profile.last_name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <span className="mt-1 inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {ROLE_LABELS[user?.role || ''] || user?.role}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={saveProfile} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Persönliche Daten</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vorname</label>
                <input type="text" value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))}
                  required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nachname</label>
                <input type="text" value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))}
                  required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>
        <div className="p-5 flex items-center justify-between">
          {profileMsg && (
            <p className={`text-sm ${profileMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {profileMsg.text}
            </p>
          )}
          <button type="submit" disabled={profileSaving}
            className="ml-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
            {profileSaving ? 'Speichern…' : 'Profil speichern'}
          </button>
        </div>
      </form>

      {/* Password form */}
      <form onSubmit={savePassword} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Passwort ändern</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aktuelles Passwort</label>
              <input type="password" value={pwd.old_password} onChange={e => setPwd(p => ({ ...p, old_password: e.target.value }))}
                required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Neues Passwort</label>
              <input type="password" value={pwd.new_password} onChange={e => setPwd(p => ({ ...p, new_password: e.target.value }))}
                required minLength={8} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <p className="text-xs text-slate-400 mt-1">Mindestens 8 Zeichen</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passwort bestätigen</label>
              <input type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>
        <div className="p-5 flex items-center justify-between">
          {pwdMsg && (
            <p className={`text-sm ${pwdMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
              {pwdMsg.text}
            </p>
          )}
          <button type="submit" disabled={pwdSaving}
            className="ml-auto bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
            {pwdSaving ? 'Ändern…' : 'Passwort ändern'}
          </button>
        </div>
      </form>

      {/* Tenant info (read-only) */}
      {tenant && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Unternehmensinfo</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              { label: 'Firmenname', value: tenant.name },
              { label: 'Entsorgernummer', value: tenant.entsorgernummer },
              { label: 'Adresse', value: tenant.address },
              { label: 'PLZ / Ort', value: [tenant.postal_code, tenant.city].filter(Boolean).join(' ') },
              { label: 'E-Mail', value: tenant.kontakt_email },
              { label: 'Telefon', value: tenant.kontakt_telefon },
            ].map(f => f.value ? (
              <div key={f.label}>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">{f.label}</p>
                <p className="text-slate-700">{f.value}</p>
              </div>
            ) : null)}
          </div>
          <p className="text-xs text-slate-400 mt-4">Firmenangaben können nur durch einen Administrator geändert werden.</p>
        </div>
      )}
    </div>
  );
}
