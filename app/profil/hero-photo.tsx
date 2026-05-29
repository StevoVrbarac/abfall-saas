'use client';

import { useState } from 'react';

export default function HeroPhoto() {
  const [missing, setMissing] = useState(false);

  return (
    <div className="flex justify-center lg:justify-end">
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
        {missing ? (
          <div className="w-full h-full rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center flex-col gap-3 text-center px-8">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <p className="text-xs text-slate-400 leading-snug">
              Foto unter<br />
              <code className="text-slate-500 font-mono">public/profile.jpg</code><br />
              ablegen
            </p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/profile.jpg"
            alt="Stevo Vrbarac"
            className="w-full h-full object-cover object-top rounded-3xl"
            onError={() => setMissing(true)}
          />
        )}
      </div>
    </div>
  );
}
