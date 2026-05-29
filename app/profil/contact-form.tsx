'use client';

import { useState } from 'react';

type FormState = { name: string; email: string; message: string };

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    await new Promise(r => setTimeout(r, 600));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Nachricht gesendet</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Vielen Dank! Ich melde mich so schnell wie möglich bei Ihnen.
        </p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Name</label>
        <input type="text" required value={form.name} onChange={set('name')} className={inputClass} placeholder="Max Mustermann" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">E-Mail</label>
        <input type="email" required value={form.email} onChange={set('email')} className={inputClass} placeholder="max@unternehmen.de" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Nachricht</label>
        <textarea required value={form.message} onChange={set('message')} rows={5} className={inputClass + ' resize-none'} placeholder="Worum geht es bei Ihrem Projekt oder Ihrer Anfrage?" />
      </div>
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-sky-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Wird gesendet…' : 'Nachricht senden'}
      </button>
    </form>
  );
}
