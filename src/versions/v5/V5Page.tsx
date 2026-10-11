import { useState } from 'react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { corridors } from '../../data/corridors'
import { companies, group, news, projects, getLocation } from '../../data'
import { Reveal } from '../../components/Reveal'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { V5CinematicMap, V5StoryPanel } from './V5Map'

function V5Nav() {
  const [open, setOpen] = useState(false)
  const links = [
    { href: '#presence', label: 'Corridors' },
    { href: '#companies', label: 'Companies' },
    { href: '#work', label: 'Work' },
    { href: '#contact', label: 'Contact' },
  ]
  return (
    <header className="absolute top-0 inset-x-0 z-40">
      <div className="flex items-center justify-between px-6 md:px-10 py-6">
        <a href="#top" className="text-[0.65rem] tracking-[0.4em] uppercase text-white/85">
          Meridian
        </a>
        <nav className="hidden md:flex gap-8" aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[0.55rem] tracking-[0.25em] uppercase text-white/40 hover:text-[var(--brand)] transition"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="md:hidden p-2 text-white/70"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden mx-6 p-5 v5-glass flex flex-col gap-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase">
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

export default function V5Page() {
  const [activeId, setActiveId] = useState('europe-atelier')
  const active = corridors.find((c) => c.id === activeId) ?? corridors[0]

  return (
    <div className="theme-v5 min-h-screen">
      <V5Nav />

      {/* Full-viewport cinematic map experience */}
      <section id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <V5CinematicMap activeId={activeId} onSelectCorridor={setActiveId} />

        <div
          id="presence"
          className="absolute inset-0 z-20 flex items-stretch pointer-events-none pt-16 md:pt-20"
        >
          <V5StoryPanel
            corridor={active}
            corridorsList={corridors}
            onSelect={setActiveId}
          />
        </div>

        <p className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-20 text-[0.55rem] tracking-[0.25em] uppercase text-white/30 pointer-events-none hidden sm:block">
          Select a corridor · Pan & zoom the map
        </p>
      </section>

      {/* Intro metrics */}
      <section className="px-6 md:px-12 py-20 border-t border-[var(--border)]">
        <Reveal className="mb-12 max-w-2xl">
          <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[var(--brand)] mb-4">
            The Network as Narrative
          </p>
          <h2
            className="text-3xl md:text-5xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Routes that explain the group.
          </h2>
          <p className="text-[var(--text-muted)] text-lg leading-relaxed">
            V5 treats Meridian’s geography as cinematic storytelling — corridors of capital,
            craft and hospitality drawn across a dark cartographic field.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { v: group.metrics.countries, s: '', l: 'Countries' },
            { v: group.metrics.locations, s: '+', l: 'Locations' },
            { v: corridors.length, s: '', l: 'Corridors' },
            { v: group.metrics.employees, s: '+', l: 'People' },
          ].map((x) => (
            <Reveal key={x.l}>
              <p className="text-4xl md:text-5xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                <AnimatedNumber value={x.v} suffix={x.s} />
              </p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[var(--text-muted)]">
                {x.l}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section id="companies" className="px-6 md:px-12 py-24 border-t border-[var(--border)]">
        <Reveal className="mb-12">
          <h2 className="text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Companies along the routes
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {companies.map((c) => (
            <article key={c.id} className="group border border-[var(--border)] overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={c.image}
                  alt=""
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[var(--brand)] mb-2">
                  {c.industry}
                </p>
                <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {c.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] line-clamp-2">{c.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section id="work" className="px-6 md:px-12 py-24 border-t border-[var(--border)]">
        <h2 className="text-4xl mb-12" style={{ fontFamily: 'var(--font-display)' }}>
          Signal projects
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p) => {
            const loc = getLocation(p.locationId)
            return (
              <article key={p.id} className="relative min-h-[280px] overflow-hidden group">
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/50 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <p className="text-[0.55rem] tracking-[0.2em] uppercase text-[var(--brand)] mb-1">
                    {loc?.city} · {p.year}
                  </p>
                  <h3 className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {p.name}
                  </h3>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="px-6 md:px-12 py-24 border-t border-[var(--border)] grid md:grid-cols-2 gap-16">
        <Reveal>
          <h2 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Philosophy
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed text-lg">{group.philosophy}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Responsibility
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed text-lg">{group.sustainability}</p>
        </Reveal>
      </section>

      <section className="px-6 md:px-12 py-20 border-t border-[var(--border)]">
        <h2 className="text-3xl mb-10" style={{ fontFamily: 'var(--font-display)' }}>
          Insights
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {news.map((n) => (
            <article key={n.id}>
              <img src={n.image} alt="" className="aspect-[4/3] object-cover mb-3" loading="lazy" />
              <p className="text-[0.55rem] tracking-widest uppercase text-[var(--text-muted)] mb-2">
                {n.category}
              </p>
              <h3 className="text-sm leading-snug">{n.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="px-6 md:px-12 py-32 border-t border-[var(--border)] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[var(--bg)]/75" />
        <div className="relative z-10 max-w-2xl">
          <h2
            className="text-4xl md:text-6xl mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Trace a corridor with us.
          </h2>
          <p className="text-[var(--text-muted)] text-lg mb-10 max-w-md">
            Partner, invest or join Meridian along any of the routes that define our presence.
          </p>
          <a
            href="mailto:hello@meridian.group"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--brand)] text-[#0a0e14] text-[0.7rem] tracking-[0.2em] uppercase font-medium"
          >
            hello@meridian.group <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-[var(--border)] flex justify-between text-[0.55rem] tracking-[0.2em] uppercase text-[var(--text-muted)] pb-28">
        <span>© {new Date().getFullYear()} Meridian Group</span>
        <span>Concept V5 — Cinematic Route Map</span>
      </footer>
    </div>
  )
}
