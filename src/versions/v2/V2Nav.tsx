import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '#presence', label: 'Presence' },
  { href: '#companies', label: 'Companies' },
  { href: '#industries', label: 'Industries' },
  { href: '#projects', label: 'Projects' },
  { href: '#news', label: 'News' },
  { href: '#contact', label: 'Contact' },
]

export function V2Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between px-5 pt-6 md:px-10 md:pt-8"
      style={{ fontFamily: 'var(--font-geo)' }}
    >
      <a
        href="#top"
        className="pointer-events-auto text-[0.7rem] tracking-[0.42em] text-white uppercase"
      >
        Meridian
      </a>

      <nav className="pointer-events-auto hidden items-center gap-8 md:flex">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-[0.6rem] tracking-[0.28em] text-white/40 uppercase transition hover:text-white"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="pointer-events-auto border border-white/15 p-2 text-white/70 md:hidden"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {open && (
        <div className="pointer-events-auto absolute inset-x-0 top-0 z-50 flex min-h-screen flex-col bg-black/98 px-6 pt-20 pb-10 md:hidden">
          <button
            type="button"
            className="absolute top-6 right-5 border border-white/15 p-2 text-white/70"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={16} />
          </button>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/10 py-4 text-sm tracking-[0.28em] text-white/70 uppercase"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}

export default V2Nav
