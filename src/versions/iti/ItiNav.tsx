import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ItiLogo from './ItiLogo'
import { COPY, type Lang } from './content'

const LINKS = [
  { href: '#about', key: 'about' },
  { href: '#vision', key: 'vision' },
  { href: '#values', key: 'values' },
  { href: '#footprint', key: 'footprint' },
  { href: '#contact', key: 'contact' },
] as const

export default function ItiNav({ lang }: { lang: Lang }) {
  const t = COPY.nav
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const other: Lang = lang === 'en' ? 'ar' : 'en'

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const light = solid || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow] duration-300 ${
        light ? 'bg-white/95 shadow-[0_1px_0_rgba(5,53,82,0.1)] backdrop-blur' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" aria-label="ITI Group" className="shrink-0">
          {/* Full horizontal logo at its 220px digital minimum (guideline p.14);
              below that, the simplified logo without the descriptor (p.16). */}
          <ItiLogo tone={light ? 'color' : 'white'} layout="horizontal" className="hidden h-[56px] w-[224px] sm:block" />
          <ItiLogo
            tone={light ? 'color' : 'white'}
            layout="horizontal"
            descriptor={false}
            className="h-9 w-[150px] sm:hidden"
          />
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <li key={l.key}>
              <a
                href={l.href}
                className={`text-[0.82rem] font-medium transition ${
                  light ? 'text-[var(--iti-ink-soft)] hover:text-[var(--iti-navy)]' : 'text-white/80 hover:text-white'
                }`}
              >
                {t[l.key][lang]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to={`/${other}`}
            lang={other}
            className={`rounded-full border px-4 py-2 text-[0.8rem] font-semibold transition ${
              light
                ? 'border-[var(--iti-line)] text-[var(--iti-navy)] hover:border-[var(--iti-navy)]'
                : 'border-white/35 text-white hover:border-white'
            }`}
            style={{ fontFamily: other === 'ar' ? 'IBM Plex Sans Arabic, sans-serif' : 'Figtree, sans-serif' }}
          >
            {t.switchLang[lang]}
          </Link>
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${light ? 'text-[var(--iti-navy)]' : 'text-white'}`}
            aria-expanded={open}
            aria-label={open ? t.close[lang] : t.menu[lang]}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[var(--iti-line)] bg-white px-5 lg:hidden"
          >
            {LINKS.map((l) => (
              <li key={l.key}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-[var(--iti-line)] py-4 text-base font-semibold text-[var(--iti-navy)] last:border-0"
                >
                  {t[l.key][lang]}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
