import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const links = [
  { href: '#intro', label: 'Group' },
  { href: '#companies', label: 'Companies' },
  { href: '#presence', label: 'Presence' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

export default function V1Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      style={{
        background: scrolled ? 'rgba(11, 26, 20, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(232, 228, 217, 0.08)'
          : '1px solid transparent',
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-10 lg:px-14"
        aria-label="Primary"
      >
        <a
          href="#top"
          className="font-[family-name:var(--font-display)] text-xl tracking-[0.04em] text-[var(--text)] md:text-2xl"
        >
          Meridian
        </a>

        <ul className="hidden items-center gap-8 md:flex lg:gap-10">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[var(--brand)] transition-opacity hover:opacity-80"
        >
          Enquire
        </a>
      </nav>
    </motion.header>
  )
}
