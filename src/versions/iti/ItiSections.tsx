import { motion } from 'framer-motion'
import { Reveal } from '../../components/Reveal'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import ItiLogo, { IconOutline } from './ItiLogo'
import { CONTACT, COPY, type Lang } from './content'

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function ItiHero({ lang }: { lang: Lang }) {
  const t = COPY.hero
  const rtl = lang === 'ar'
  return (
    <section id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--iti-navy)] text-white">
      <motion.img
        src="/iti/photos/hero.jpg"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(${rtl ? '255deg' : '105deg'}, rgba(3,38,60,0.96) 0%, rgba(5,53,82,0.88) 38%, rgba(5,53,82,0.45) 70%, rgba(5,53,82,0.25) 100%)`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[var(--iti-navy-deep)] to-transparent" />

      {/* Brand geometry — oversized outline of the logo icon */}
      <IconOutline
        className="pointer-events-none absolute -end-[8vw] top-[8vh] -z-10 hidden h-[88vh] text-white/[0.14] md:block"
        strokeWidth={1.2}
      />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 pt-28 pb-16 sm:px-8">
        <motion.p
          className="iti-eyebrow iti-eyebrow-light"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t.eyebrow[lang]}
        </motion.p>
        <motion.h1
          className="iti-display mt-6 max-w-[15ch] text-[clamp(2.6rem,6vw,5.4rem)] rtl:max-w-[16ch] rtl:text-[clamp(2.3rem,5.2vw,4.6rem)]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {t.title[lang]}
        </motion.h1>
        <motion.p
          className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-white/80 sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          {t.lead[lang]}
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          <a href="#footprint" className="iti-btn iti-btn-copper">
            {t.ctaPrimary[lang]}
            <Arrow rtl={rtl} />
          </a>
          <a href="#about" className="iti-btn iti-btn-ghost">
            {t.ctaSecondary[lang]}
          </a>
        </motion.div>
      </div>

      <div className="border-t border-white/12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-5 text-[0.72rem] tracking-[0.12em] text-white/60 uppercase sm:px-8">
          <span className="leading-relaxed">{t.countries[lang]}</span>
          <a href="#about" className="hidden shrink-0 items-center gap-3 sm:inline-flex hover:text-white">
            {t.scroll[lang]}
            <span className="relative h-8 w-px overflow-hidden bg-white/25">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-white"
                animate={{ y: [-12, 32] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

function Arrow({ rtl }: { rtl: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${rtl ? '-scale-x-100' : ''}`} aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* About + stats                                                       */
/* ------------------------------------------------------------------ */

export function ItiAbout({ lang }: { lang: Lang }) {
  const t = COPY.about
  return (
    <section id="about" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
            <h2 className="iti-h2 mt-5">{t.title[lang]}</h2>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <p className="text-[1.08rem] leading-[1.8] text-[var(--iti-ink-soft)]">{t.body[lang]}</p>
            <div className="mt-10">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[var(--iti-navy)]">
                {t.highlightsTitle[lang]}
              </p>
              <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
                {t.highlights.map((h) => (
                  <li key={h.en} className="flex gap-3 border-b border-[var(--iti-line)] py-3.5 text-[0.92rem] text-[var(--iti-navy)]">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--iti-copper)]" aria-hidden />
                    {h[lang]}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[var(--iti-line)] ring-1 ring-[var(--iti-line)] md:grid-cols-5">
          {COPY.stats.map((s, i) => (
            <Reveal key={s.label.en} delay={i * 0.06} className={`bg-[var(--iti-mist)] p-6 sm:p-8 ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
              <dd className="font-[family-name:var(--iti-head)] text-[clamp(2rem,3.4vw,3rem)] leading-none font-extrabold tracking-tight text-[var(--iti-navy)]" dir="ltr">
                <AnimatedNumber value={s.value} prefix={s.prefix} replay />
                <span className="text-[var(--iti-copper)]">{s.suffix}</span>
              </dd>
              <dt className="mt-3 text-[0.82rem] font-medium text-[var(--iti-ink-soft)]">{s.label[lang]}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Vision & Mission                                                    */
/* ------------------------------------------------------------------ */

export function ItiVision({ lang }: { lang: Lang }) {
  const blocks = [COPY.vision, COPY.mission]
  return (
    <section id="vision" className="relative isolate overflow-hidden bg-[var(--iti-navy)] py-24 text-white sm:py-32">
      <img src="/iti/photos/vision.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--iti-navy)] via-[var(--iti-navy)]/85 to-[var(--iti-navy-deep)]" />
      <div className="iti-pattern-light absolute inset-0 -z-10 opacity-[0.05]" />
      <div className="mx-auto grid max-w-[1400px] gap-16 px-5 sm:px-8 md:grid-cols-2 md:gap-0">
        {blocks.map((b, i) => (
          <Reveal
            key={b.eyebrow.en}
            delay={i * 0.12}
            className={i === 1 ? 'md:border-s md:border-white/15 md:ps-16' : 'md:pe-16'}
          >
            <p className="iti-eyebrow iti-eyebrow-light">{b.eyebrow[lang]}</p>
            <p className="mt-3 text-sm text-white/50">{b.kicker[lang]}</p>
            <p className="mt-8 font-[family-name:var(--iti-head)] text-[clamp(1.5rem,2.4vw,2.15rem)] leading-[1.3] font-semibold">
              {b.body[lang]}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Values                                                              */
/* ------------------------------------------------------------------ */

export function ItiValues({ lang }: { lang: Lang }) {
  const t = COPY.values
  return (
    <section id="values" className="relative isolate bg-white py-24 sm:py-32">
      <div className="iti-pattern pointer-events-none absolute inset-y-0 end-0 -z-10 w-1/2 opacity-[0.06] [mask-image:linear-gradient(to_left,black,transparent)] rtl:[mask-image:linear-gradient(to_right,black,transparent)]" />
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
          <h2 className="iti-h2 mt-5">{t.title[lang]}</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((v, i) => (
            <Reveal key={v.id} delay={(i % 3) * 0.08}>
              <article className="group flex h-full overflow-hidden rounded-2xl bg-[var(--iti-mist)] ring-1 ring-[var(--iti-line)] transition hover:ring-[var(--iti-steel)]">
                <div className="relative w-[38%] shrink-0 overflow-hidden">
                  <img
                    src={`/iti/photos/value-${v.id}.jpg`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[var(--iti-navy)]/15" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="font-[family-name:var(--iti-head)] text-xs font-bold text-[var(--iti-copper)]" dir="ltr">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-[family-name:var(--iti-head)] text-lg font-extrabold tracking-wide text-[var(--iti-navy)] uppercase">
                    {v.title[lang]}
                  </h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--iti-ink-soft)]">{v.body[lang]}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Contact + footer                                                    */
/* ------------------------------------------------------------------ */

export function ItiContact({ lang }: { lang: Lang }) {
  const t = COPY.contact
  const rtl = lang === 'ar'
  return (
    <section id="contact" className="bg-[var(--iti-navy)] text-white">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-12">
        <Reveal className="px-5 py-24 sm:px-8 sm:py-32 lg:col-span-7 lg:pe-16">
          <p className="iti-eyebrow iti-eyebrow-light">{t.eyebrow[lang]}</p>
          <h2 className="iti-display mt-6 max-w-[16ch] text-[clamp(2.2rem,4.6vw,4rem)]">{t.title[lang]}</h2>
          <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-white/70">{t.body[lang]}</p>

          <dl className="mt-12 grid gap-8 sm:grid-cols-3">
            <div>
              <dt className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-white/45">{t.email[lang]}</dt>
              <dd className="mt-2">
                <a href={`mailto:${CONTACT.email}`} className="text-sm font-semibold break-all hover:text-[var(--iti-copper-soft)]" dir="ltr">
                  {CONTACT.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-white/45">{t.website[lang]}</dt>
              <dd className="mt-2">
                <a href={CONTACT.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:text-[var(--iti-copper-soft)]" dir="ltr">
                  {CONTACT.website}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-white/45">{t.office[lang]}</dt>
              <dd className="mt-2 text-sm font-semibold leading-relaxed">{t.address[lang]}</dd>
            </div>
          </dl>

          <a href={`mailto:${CONTACT.email}`} className="iti-btn iti-btn-copper mt-12">
            {t.cta[lang]}
            <Arrow rtl={rtl} />
          </a>
        </Reveal>
        <div className="relative hidden min-h-[520px] overflow-hidden lg:col-span-5 lg:block">
          <img src="/iti/photos/contact.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--iti-navy)] via-transparent to-transparent rtl:bg-gradient-to-l" />
        </div>
      </div>
    </section>
  )
}

export function ItiFooter({ lang }: { lang: Lang }) {
  const t = COPY.footer
  const nav = COPY.nav
  return (
    <footer className="border-t border-white/10 bg-[var(--iti-navy-deep)] text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <ItiLogo tone="white" layout="horizontal" className="h-[56px] w-[224px]" />
          <p className="mt-5 text-[0.72rem] font-semibold tracking-[0.22em] uppercase text-white/50">{t.tagline[lang]}</p>
        </div>
        <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/65">
          {(['about', 'vision', 'values', 'footprint', 'contact'] as const).map((k) => (
            <li key={k}>
              <a href={`#${k}`} className="hover:text-white">
                {nav[k][lang]}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1400px] px-5 py-6 text-xs text-white/45 sm:px-8">{t.rights[lang]}</p>
      </div>
    </footer>
  )
}
