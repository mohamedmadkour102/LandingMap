import { group, companies, countries } from '../../data'

const nav = [
  { href: '#intro', label: 'The Group' },
  { href: '#companies', label: 'Companies' },
  { href: '#presence', label: 'Presence' },
  { href: '#projects', label: 'Projects' },
  { href: '#philosophy', label: 'Philosophy' },
  { href: '#news', label: 'News' },
  { href: '#contact', label: 'Contact' },
]

export default function V1Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] pb-28 pt-20 md:pt-28">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-14">
        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5 lg:col-span-4">
            <p className="font-[family-name:var(--font-display)] text-4xl tracking-[-0.02em] text-[var(--text)] md:text-5xl">
              Meridian
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
              {group.tagline} Headquartered in {group.headquarters}, operating
              across {group.metrics.countries} countries since {group.founded}.
            </p>
            <a
              href="mailto:hello@meridiangroup.example"
              className="mt-8 inline-block text-sm text-[var(--brand)] transition hover:opacity-80"
            >
              hello@meridiangroup.example
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6">
            <div>
              <p className="mb-4 text-[0.6rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Navigate
              </p>
              <ul className="space-y-2.5">
                {nav.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-[var(--text)]/85 transition hover:text-[var(--brand)]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-[0.6rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Companies
              </p>
              <ul className="space-y-2.5">
                {companies.map((c) => (
                  <li key={c.id}>
                    <a
                      href="#companies"
                      className="text-sm text-[var(--text)]/85 transition hover:text-[var(--brand)]"
                    >
                      {c.shortName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="mb-4 text-[0.6rem] uppercase tracking-[0.24em] text-[var(--text-muted)]">
                Markets
              </p>
              <ul className="space-y-2.5">
                {countries.map((c) => (
                  <li key={c.id}>
                    <a
                      href="#presence"
                      className="text-sm text-[var(--text)]/85 transition hover:text-[var(--brand)]"
                    >
                      {c.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-[var(--border)] pt-8 md:mt-28 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            © {new Date().getFullYear()} {group.legalName}. All rights reserved.
          </p>
          <p className="font-[family-name:var(--font-display)] text-sm italic text-[var(--text-muted)]">
            Editorial Geographic Atlas — Concept V1
          </p>
        </div>
      </div>
    </footer>
  )
}
