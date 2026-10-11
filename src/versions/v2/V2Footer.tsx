import { ArrowUpRight } from 'lucide-react'
import { group } from '../../data'

const columns = [
  {
    title: 'Explore',
    links: [
      { label: 'Presence', href: '#presence' },
      { label: 'Companies', href: '#companies' },
      { label: 'Industries', href: '#industries' },
      { label: 'Projects', href: '#projects' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'News', href: '#news' },
      { label: 'Contact', href: '#contact' },
      { label: 'Careers', href: '#contact' },
    ],
  },
]

export function V2Footer() {
  return (
    <footer
      className="border-t border-white/10 bg-black px-5 pt-16 pb-28 md:px-10"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="mb-3 text-[0.7rem] tracking-[0.42em] text-white uppercase">
              {group.name}
            </p>
            <p className="mb-2 text-sm text-white/50">{group.tagline}</p>
            <p className="text-xs text-white/30">
              HQ · {group.headquarters} · Est. {group.founded}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[0.55rem] tracking-[0.3em] text-white/35 uppercase">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-xs tracking-[0.12em] text-white/50 uppercase transition hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.55rem] tracking-[0.2em] text-white/25 uppercase">
            © {new Date().getFullYear()} {group.legalName}. Concept exploration.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-[0.6rem] tracking-[0.22em] text-white/40 uppercase transition hover:text-white"
          >
            Back to network
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default V2Footer
