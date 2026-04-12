import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const role = h.get('x-role');

  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Admin sub-nav */}
      <div className="mb-6 flex items-center gap-1 text-sm">
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium text-xs uppercase tracking-wide">Admin</span>
        <svg className="w-4 h-4 text-slate-300 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <nav className="flex gap-1">
          {[
            { href: '/admin', label: 'Übersicht' },
            { href: '/admin/mieter', label: 'Mandanten' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
