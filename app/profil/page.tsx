import type { Metadata } from 'next';
import ContactForm from './contact-form';
import HeroPhoto from './hero-photo';

export const metadata: Metadata = {
  title: 'Stevo Vrbarac – Berater & Interim Manager | Entsorgungswirtschaft',
  description:
    'Erfahrener Führungsexperte mit über 10 Jahren in der Entsorgungs- und Recyclingbranche. P&L-Verantwortung, Standortentwicklung, operative Exzellenz.',
};

export default function ProfilPage() {
  return (
    <div className="bg-white text-slate-900" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-sky-600 text-lg tracking-tight">SV</span>
          <div className="hidden sm:flex items-center gap-8 text-sm text-slate-500">
            <a href="#ueber-mich" className="hover:text-slate-900 transition-colors">Über mich</a>
            <a href="#leistungen" className="hover:text-slate-900 transition-colors">Leistungen</a>
            <a href="#kontakt" className="hover:text-slate-900 transition-colors">Kontakt</a>
          </div>
          <a
            href="#kontakt"
            className="text-sm font-medium bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Gespräch anfragen
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col justify-center pt-16 px-6">
        <div className="max-w-5xl mx-auto w-full py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-full px-4 py-1.5 mb-10">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                <span className="text-sm text-sky-700">Verfügbar für neue Mandate</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold leading-none tracking-tight mb-6">
                Stevo<br />Vrbarac
              </h1>
              <p className="text-xl sm:text-2xl text-slate-400 font-light mb-5">
                Interim Manager & Berater — Entsorgungswirtschaft
              </p>
              <p className="text-base text-slate-500 leading-relaxed mb-12">
                10+ Jahre operative Führungserfahrung in der Entsorgungs- und Recyclingbranche.
                Ich übernehme Verantwortung wo es zählt — von der Niederlassungsleitung mit
                voller P&L-Verantwortung bis zur standortübergreifenden Restrukturierung.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#kontakt"
                  className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
                >
                  Erstgespräch vereinbaren
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <a
                  href="#leistungen"
                  className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-6 py-3 rounded-lg text-sm font-medium hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Meine Leistungen
                </a>
              </div>
            </div>

            {/* Photo */}
            <HeroPhoto />
          </div>
        </div>
      </section>

      {/* ── Über mich ── */}
      <section id="ueber-mich" className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold tracking-widest text-sky-500 uppercase mb-4">Über mich</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl font-bold mb-8 leading-tight text-slate-900">
                Ergebnisverantwortung,<br />die wirklich greift.
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                <p>
                  Als Niederlassungsleiter bei der ALBA Süd GmbH habe ich drei Standorte in
                  Oberschwaben geführt, einen Business Case zur Reaktivierung einer Sortieranlage
                  entwickelt und umgesetzt — Ergebnis: rund 1,7 Mio. € Mehrertrag. Gleichzeitig
                  habe ich den Einsatz von Leiharbeitskräften standortübergreifend bedarfsorientiert
                  gesteuert und die Personalkosten deutlich gesenkt.
                </p>
                <p>
                  Meine Stärke liegt in der Verbindung von strategischem Denken und konsequenter
                  operativer Umsetzung. Ich kenne kommunale Auftraggeber, behördliche Anforderungen
                  und die KPIs, die in dieser Branche wirklich zählen.
                </p>
                <p>
                  Mit dem Fachkundenachweis Abfallmanagement (EfbV · AbfAEV · AbfBeauftrV) und dem
                  ALBA-Führungskräfteprogramm bringe ich fundiertes Branchen-Know-how auf
                  Executive-Level mit.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-100">
                  <div className="text-3xl font-bold text-sky-600 mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400 leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Leistungen ── */}
      <section id="leistungen" className="py-28">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold tracking-widest text-sky-500 uppercase mb-4">Leistungen</p>
          <h2 className="text-4xl font-bold mb-4 text-slate-900">Was ich für Sie tue.</h2>
          <p className="text-slate-500 mb-16 max-w-xl text-sm sm:text-base">
            Keine Theorie von außen — sondern echte operative Erfahrung aus vergleichbaren
            Unternehmen der Branche, angewandt auf Ihre Situation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-8 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-6 text-xl">
                  {service.icon}
                </div>
                <h3 className="text-base font-semibold mb-3 text-slate-900">{service.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.bullets.map((b) => (
                    <li key={b} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-slate-300">—</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kontakt ── */}
      <section id="kontakt" className="py-28 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-xs font-semibold tracking-widest text-sky-500 uppercase mb-4">Kontakt</p>
              <h2 className="text-4xl font-bold mb-6 leading-tight text-slate-900">
                Lassen Sie uns<br />sprechen.
              </h2>
              <p className="text-slate-500 leading-relaxed mb-10 text-sm sm:text-base">
                Sie suchen Unterstützung bei operativen Herausforderungen, planen eine
                Restrukturierung oder benötigen eine erfahrene Führungskraft auf Zeit?
                Ich freue mich auf ein unverbindliches Erstgespräch.
              </p>
              <div className="space-y-5">
                {contactItems.map((item) => (
                  item.href ? (
                    <a key={item.label} href={item.href} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-slate-300 transition-colors text-base">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                        <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{item.value}</div>
                      </div>
                    </a>
                  ) : (
                    <div key={item.label} className="flex items-center gap-4">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 text-base">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                        <div className="text-sm font-medium text-slate-700">{item.value}</div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© 2026 Stevo Vrbarac</span>
          <span>Interim Management · Beratung · Entsorgungswirtschaft</span>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: '10+', label: 'Jahre Branchenerfahrung' },
  { value: '155', label: 'Mitarbeitende geführt' },
  { value: '1,7 Mio. €', label: 'Mehrertrag (ALBA-Projekt)' },
  { value: '4+', label: 'Standorte verantwortet' },
];

const services = [
  {
    icon: '⚙',
    title: 'Interim Management',
    description:
      'Übernahme operativer Führungsverantwortung auf Zeit — Niederlassungsleitung, Standortmanagement oder Krisenintervention mit voller Ergebnisverantwortung.',
    bullets: [
      'P&L-Steuerung & BWA-Reporting',
      'Personalführung bis 155 MA',
      'Kommunen & Behördenkontakte',
      'Zertifizierungsbegleitung (EfbV, QM)',
    ],
  },
  {
    icon: '◎',
    title: 'Restrukturierung & Effizienz',
    description:
      'Analyse von Kosten- und Prozesspotenzialen mit anschließender, nachweislich messbarer Umsetzung — kein Konzept ohne Konsequenz.',
    bullets: [
      'Kostensenkung & Personaloptimierung',
      'Leiharbeit bedarfsorientiert steuern',
      'Business Case Entwicklung',
      'Standort- & Auslastungsanalysen',
    ],
  },
  {
    icon: '▲',
    title: 'Strategie & Beratung',
    description:
      'Branchenspezifische Strategieberatung für Entsorgungs- und Recyclingunternehmen — von der Marktanalyse bis zur operativen Roadmap.',
    bullets: [
      'Stoffstrom- & Verwertungsoptimierung',
      'Netzwerkentwicklung (Regional/National)',
      'Vertragsverhandlung mit Anlagen',
      'Organisationsentwicklung',
    ],
  },
];

const contactItems = [
  { icon: '📞', label: 'Telefon', value: '+49 1516 8492090', href: 'tel:+4915168492090' },
  { icon: '✉', label: 'E-Mail', value: 'kontakt@stevovrbarac.de', href: 'mailto:kontakt@stevovrbarac.de' },
  { icon: '📍', label: 'Standort', value: 'Landau an der Isar', href: null },
];
