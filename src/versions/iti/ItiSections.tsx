import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Reveal } from '../../components/Reveal'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import ItiLogo, { IconOutline } from './ItiLogo'
import { Picture } from './media'
import { requestAsset } from './mapBus'
import { EASE_OUT, MaskReveal, Magnetic, Parallax, ScrollWords, SplitReveal, spotlight } from './fx'
import { ASSETS, BUSINESS_GROUPS, CONTACT, COPY, MARKETS, type Lang } from './content'

/** Words at the end of a headline that carry the copper-champagne gradient */
const emph = (lang: Lang, en: number, ar: number) => (lang === 'ar' ? ar : en)

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export function ItiHero({ lang }: { lang: Lang }) {
  const t = COPY.hero
  const rtl = lang === 'ar'
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement | null>(null)

  // scroll: the photo sinks slower than the page, the copy lifts and fades
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90])
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  // pointer: the brand outline drifts against the cursor, very slightly
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const gx = useSpring(mx, { stiffness: 60, damping: 20 })
  const gy = useSpring(my, { stiffness: 60, damping: 20 })

  return (
    <section
      id="top"
      ref={ref}
      className="iti-grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--iti-ink-deep)] text-white"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse') return
        mx.set((e.clientX / window.innerWidth - 0.5) * -28)
        my.set((e.clientY / window.innerHeight - 0.5) * -18)
      }}
    >
      {/* Royal El Minya at dusk — a real Group plant, slow push-in */}
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y: photoY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: EASE_OUT }}
        >
          <div className="iti-kenburns absolute inset-0">
            <Picture k="hero" sizes="100vw" priority className="h-full w-full object-cover object-[62%_50%]" />
          </div>
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(${rtl ? '255deg' : '105deg'}, rgba(1,19,31,0.95) 0%, rgba(3,38,60,0.84) 34%, rgba(5,53,82,0.36) 64%, rgba(5,53,82,0.08) 100%)`,
        }}
      />
      {/* dusk glow behind the plant, echoing the sunset in the photo */}
      <div className="pointer-events-none absolute -z-10 h-[70vmax] w-[70vmax] rounded-full opacity-60 blur-3xl [background:radial-gradient(circle,rgba(212,137,95,0.35),transparent_62%)] end-[-18vmax] top-[8vh]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-[var(--iti-ink-deep)] via-[var(--iti-ink-deep)]/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-[var(--iti-ink-deep)]/70 to-transparent" />

      {/* Brand geometry — oversized outline of the logo icon, draws itself in */}
      <motion.div className="pointer-events-none absolute -end-[6vw] top-[10vh] -z-10 hidden md:block" style={reduce ? undefined : { x: gx, y: gy }}>
        <IconOutline className="iti-draw h-[84vh] text-white/[0.12]" strokeWidth={1.1} />
      </motion.div>

      <motion.div
        className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 pt-32 pb-14 sm:px-8"
        style={reduce ? undefined : { y: copyY, opacity: copyO }}
      >
        <motion.p
          className="iti-eyebrow iti-eyebrow-light"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          {t.eyebrow[lang]}
        </motion.p>
        <SplitReveal
          as="h1"
          immediate
          delay={0.35}
          emphasis={emph(lang, 2, 1)}
          text={t.title[lang]}
          className="iti-display mt-6 max-w-[14ch] text-[clamp(2.8rem,6.8vw,6.4rem)] rtl:max-w-[15ch] rtl:text-[clamp(2.4rem,5.6vw,5.2rem)]"
        />
        <motion.p
          className="mt-7 max-w-xl text-[1.06rem] leading-relaxed text-white/80 sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
        >
          {t.lead[lang]}
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          <Magnetic>
            <a href="#footprint" className="iti-btn iti-btn-copper group">
              {t.ctaPrimary[lang]}
              <Arrow rtl={rtl} />
            </a>
          </Magnetic>
          <Magnetic strength={0.18}>
            <a href="#about" className="iti-btn iti-btn-ghost">
              {t.ctaSecondary[lang]}
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.p
        className="iti-photo-caption absolute end-5 bottom-24 hidden text-white/60 sm:end-8 md:inline-flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        {t.photoCaption[lang]}
      </motion.p>

      <div className="relative border-t border-white/12">
        {/* a copper filament runs along the hero's base once, on load */}
        <motion.span
          className="absolute -top-px start-0 h-px w-full origin-left bg-gradient-to-r from-transparent via-[var(--iti-copper-soft)] to-transparent rtl:origin-right"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0.7 }}
          transition={{ delay: 1.1, duration: 1.6, ease: EASE_OUT }}
          aria-hidden
        />
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-5 text-[0.72rem] tracking-[0.12em] text-white/60 uppercase sm:px-8">
          <span className="leading-relaxed">{t.countries[lang]}</span>
          <a href="#about" className="hidden shrink-0 items-center gap-3 sm:inline-flex hover:text-white">
            {t.scroll[lang]}
            <span className="relative h-8 w-px overflow-hidden bg-white/25">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-white"
                animate={reduce ? undefined : { y: [-12, 32] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

function Arrow({ rtl, className = '' }: { rtl: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`iti-arrow h-3.5 w-3.5 ${rtl ? '-scale-x-100' : ''} ${className}`} aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* About — an editorial composition: layered photos, a giant "50",     */
/* a lead that lights up as you read it, then a night-blue stats band  */
/* ------------------------------------------------------------------ */

export function ItiAbout({ lang }: { lang: Lang }) {
  const t = COPY.about
  const companies = BUSINESS_GROUPS.reduce((n, g) => n + g.items.length, 0)
  const badge = [
    { n: companies, l: t.badge.companies[lang] },
    { n: MARKETS.length, l: t.badge.regions[lang] },
    { n: ASSETS.length, l: t.badge.sites[lang] },
  ]
  return (
    <section id="about" className="relative overflow-hidden bg-white pt-24 sm:pt-36">
      {/* light atmosphere — a steel haze to one side, copper warmth low on the other */}
      <div className="pointer-events-none absolute -top-40 end-[-10%] h-[680px] w-[680px] rounded-full opacity-70 blur-3xl [background:radial-gradient(circle,rgba(33,92,126,0.14),transparent_65%)]" />
      <div className="pointer-events-none absolute bottom-40 start-[-12%] h-[520px] w-[520px] rounded-full opacity-60 blur-3xl [background:radial-gradient(circle,rgba(169,97,58,0.1),transparent_65%)]" />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6 lg:pt-6">
            <Reveal>
              <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
            </Reveal>
            <SplitReveal text={t.title[lang]} emphasis={emph(lang, 2, 2)} className="iti-h2 mt-5 max-w-[17ch]" />
            <ScrollWords
              text={t.lead[lang]}
              className="mt-8 font-[family-name:var(--iti-head)] text-[clamp(1.25rem,1.9vw,1.55rem)] leading-[1.45] font-semibold text-[var(--iti-navy)]"
            />
            <Reveal delay={0.05}>
              <p className="mt-6 max-w-[56ch] text-[1.02rem] leading-[1.85] text-[var(--iti-ink-soft)]">{t.body[lang]}</p>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[var(--iti-navy)]">{t.highlightsTitle[lang]}</p>
              <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
                {t.highlights.map((h) => (
                  <li key={h.en} className="iti-highlight flex gap-3 border-b border-[var(--iti-line)] py-3.5 text-[0.92rem] text-[var(--iti-navy)]">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--iti-copper)] transition-transform duration-500" aria-hidden />
                    {h[lang]}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* the composition */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto aspect-[5/6] w-full max-w-[620px] sm:aspect-[6/6] lg:aspect-[5/6]">
              {/* giant outlined numeral — the five decades, drifting behind the photos */}
              <Parallax distance={70} className="pointer-events-none absolute -bottom-[10%] end-[-3%] z-0 select-none">
                <span className="iti-outline-num block font-[family-name:var(--iti-head)] text-[clamp(6rem,13vw,11rem)] leading-none font-extrabold" dir="ltr" aria-hidden>
                  50+
                </span>
              </Parallax>

              <MaskReveal className="absolute end-0 top-0 z-10 h-[80%] w-[74%] bg-[var(--iti-mist)] shadow-[0_40px_90px_-40px_rgba(5,53,82,0.55)]" drift={50}>
                <Picture k="amreyah-aerial" sizes="(min-width: 1024px) 500px, 80vw" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--iti-navy-deep)]/55 via-transparent to-[var(--iti-navy)]/10" />
              </MaskReveal>
              <p className="iti-photo-caption absolute end-5 top-4 z-20 text-white/90">{t.photoCaption[lang]}</p>

              <Parallax distance={-40} className="absolute start-0 -bottom-[4%] z-20 w-[40%]">
                <MaskReveal
                  className="aspect-[4/5] bg-[var(--iti-navy)] shadow-[0_30px_60px_-24px_rgba(5,53,82,0.6)] ring-[6px] ring-white"
                  drift={30}
                  from="top"
                  radius={22}
                  delay={0.25}
                >
                  <Picture k="bmic" sizes="(min-width: 1024px) 290px, 46vw" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--iti-navy-deep)]/70 to-transparent" />
                  <span className="iti-photo-caption absolute start-4 bottom-3 text-white/85">{t.secondCaption[lang]}</span>
                </MaskReveal>
              </Parallax>

              {/* glass badge — counts straight from the data */}
              <motion.div
                className="absolute start-0 top-[6%] z-30 flex gap-5 rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-[0_20px_50px_-24px_rgba(5,53,82,0.5)] backdrop-blur-md"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ delay: 0.7, duration: 0.8, ease: EASE_OUT }}
              >
                {badge.map((b) => (
                  <div key={b.l} className="min-w-0">
                    <p className="font-[family-name:var(--iti-head)] text-2xl leading-none font-extrabold text-[var(--iti-navy)]" dir="ltr">
                      <AnimatedNumber value={b.n} />
                    </p>
                    <p className="mt-1.5 max-w-[9ch] text-[0.64rem] leading-tight font-semibold tracking-[0.06em] text-[var(--iti-ink-soft)] uppercase">{b.l}</p>
                  </div>
                ))}
              </motion.div>

              {/* copper rule drawn down the seam of the composition */}
              <motion.span
                className="absolute end-[82%] top-[10%] z-0 hidden h-[60%] w-px origin-top bg-gradient-to-b from-[var(--iti-copper)] to-transparent lg:block"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.4 }}
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>

      {/* stats — a night-blue band that hands the page over to Vision */}
      <div className="iti-grain relative mt-24 overflow-hidden bg-[linear-gradient(180deg,var(--iti-navy)_0%,var(--iti-navy)_100%)] text-white sm:mt-32">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_120%_at_50%_0%,rgba(33,92,126,0.65),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--iti-copper-soft)]/70 to-transparent" />
        <dl className="relative mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-5">
          {COPY.stats.map((s, i) => (
            <Reveal
              key={s.label.en}
              delay={i * 0.07}
              className={`iti-stat group relative px-5 py-12 sm:px-8 sm:py-16 ${i > 0 ? 'md:border-s md:border-white/10' : ''} ${
                i % 2 === 1 ? 'border-s border-white/10 md:border-s' : ''
              } ${i >= 2 ? 'border-t border-white/10 md:border-t-0' : ''} ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}
            >
              <dd
                className="font-[family-name:var(--iti-head)] text-[clamp(2.5rem,4.2vw,3.8rem)] leading-none font-extrabold tracking-tight text-white [text-shadow:0_0_40px_rgba(143,196,227,0.35)]"
                dir="ltr"
              >
                <AnimatedNumber value={s.value} prefix={s.prefix} replay />
                <span className="iti-grad-text">{s.suffix}</span>
              </dd>
              <dt className="mt-4 text-[0.82rem] font-medium text-white/60 transition-colors group-hover:text-white/90">{s.label[lang]}</dt>
              <span className="absolute inset-x-5 bottom-0 h-px origin-left scale-x-0 bg-[var(--iti-copper-soft)] transition-transform duration-500 group-hover:scale-x-100 sm:inset-x-8 rtl:origin-right" aria-hidden />
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
  const v = COPY.vision
  const m = COPY.mission
  return (
    <section id="vision" className="iti-grain relative isolate overflow-hidden bg-[var(--iti-navy)] py-24 text-white sm:py-36">
      {/* BMIC by night — the plant glows on the far side, the statement sits on deep navy */}
      <Parallax distance={50} className="absolute inset-y-[-8%] end-0 -z-20 w-full lg:w-[62%]">
        <Picture k="bmic-night" sizes="(min-width: 1024px) 62vw, 100vw" className="h-full w-full object-cover opacity-55 lg:opacity-90" />
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--iti-navy)_0%,var(--iti-navy)_38%,rgba(5,53,82,0.55)_70%,rgba(5,53,82,0.25)_100%)] rtl:bg-[linear-gradient(270deg,var(--iti-navy)_0%,var(--iti-navy)_38%,rgba(5,53,82,0.55)_70%,rgba(5,53,82,0.25)_100%)] max-lg:bg-[rgba(5,53,82,0.82)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,var(--iti-navy)_0%,transparent_30%,transparent_65%,var(--iti-navy-deep)_100%)]" />
      <div className="iti-pattern-light absolute inset-0 -z-10 opacity-[0.04]" />

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <p className="iti-eyebrow iti-eyebrow-light">{v.eyebrow[lang]}</p>
            <p className="text-sm text-white/45">{v.kicker[lang]}</p>
          </div>
        </Reveal>
        <div className="relative mt-8">
          <span className="iti-grad-text pointer-events-none absolute -top-[0.35em] -start-[0.05em] font-[family-name:var(--iti-head)] text-[clamp(5rem,9vw,8rem)] leading-none font-extrabold opacity-80" aria-hidden>
            “
          </span>
          <SplitReveal
            as="p"
            text={v.body[lang]}
            emphasis={emph(lang, 3, 2)}
            className="relative max-w-[26ch] ps-[0.6em] font-[family-name:var(--iti-head)] text-[clamp(1.9rem,3.8vw,3.4rem)] leading-[1.18] font-bold tracking-[-0.01em]"
          />
        </div>

        <Reveal delay={0.12} className="mt-16 grid gap-8 border-t border-white/15 pt-10 md:grid-cols-12 sm:mt-24">
          <div className="md:col-span-4">
            <p className="iti-eyebrow iti-eyebrow-light">{m.eyebrow[lang]}</p>
            <p className="mt-3 text-sm text-white/45">{m.kicker[lang]}</p>
          </div>
          <div className="md:col-span-8">
            <ScrollWords text={m.body[lang]} className="text-[clamp(1.15rem,1.8vw,1.5rem)] leading-[1.55] text-white" />
          </div>
        </Reveal>
        <p className="iti-photo-caption mt-10 text-white/55">{v.photoCaption[lang]}</p>
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
    <section id="values" className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
      <div className="iti-pattern pointer-events-none absolute inset-y-0 end-0 -z-10 w-1/2 opacity-[0.05] [mask-image:linear-gradient(to_left,black,transparent)] rtl:[mask-image:linear-gradient(to_right,black,transparent)]" />
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
            </Reveal>
            <SplitReveal text={t.title[lang]} emphasis={emph(lang, 1, 1)} className="iti-h2 mt-5 max-w-[14ch]" />
            <MaskReveal className="mt-10 aspect-[4/3] bg-[var(--iti-mist)]" radius={24} drift={36} from="start">
              <Picture k="cleopatra-team" sizes="(min-width: 1024px) 520px, 100vw" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--iti-navy-deep)]/70 via-transparent to-transparent" />
              <span className="iti-photo-caption absolute start-5 bottom-4 text-white/85">{t.photoCaption[lang]}</span>
            </MaskReveal>
          </div>
        </div>

        <ol className="grid border-t border-[var(--iti-line)] sm:grid-cols-2 lg:col-span-7">
          {t.items.map((v, i) => (
            <li key={v.id} className={`border-b border-[var(--iti-line)] ${i % 2 === 1 ? 'sm:border-s' : ''}`}>
              <Reveal delay={(i % 2) * 0.08} className="h-full">
                <div onPointerMove={spotlight} className="iti-value-row iti-spot group relative h-full px-1 py-8 sm:px-8 sm:py-10">
                  <span className="iti-value-num relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--iti-copper)]/40 font-[family-name:var(--iti-head)] text-[0.78rem] font-bold text-[var(--iti-copper)]" dir="ltr">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 font-[family-name:var(--iti-head)] text-xl font-extrabold tracking-wide text-[var(--iti-navy)] uppercase transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    {v.title[lang]}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--iti-ink-soft)]">{v.body[lang]}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Our businesses — the nine companies, grouped as in the client file  */
/* ------------------------------------------------------------------ */

export function ItiBusinesses({ lang }: { lang: Lang }) {
  const t = COPY.businesses
  const rtl = lang === 'ar'
  return (
    <section id="businesses" className="iti-businesses relative overflow-hidden pt-24 pb-40 sm:pt-32 sm:pb-52">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
            </Reveal>
            <SplitReveal text={t.title[lang]} emphasis={emph(lang, 3, 2)} className="iti-h2 mt-5 max-w-[20ch]" />
          </div>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="text-[1rem] leading-relaxed text-[var(--iti-ink-soft)]">{t.body[lang]}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {BUSINESS_GROUPS.map((g, gi) => (
            <Reveal key={g.id} delay={gi * 0.08}>
              <div className="relative flex items-baseline gap-3 pt-4">
                <motion.span
                  className="absolute inset-x-0 top-0 h-[2px] origin-left bg-[var(--iti-navy)] rtl:origin-right"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 + gi * 0.1 }}
                  aria-hidden
                />
                <span className="font-[family-name:var(--iti-head)] text-sm font-bold text-[var(--iti-copper)]" dir="ltr">
                  {String(gi + 1).padStart(2, '0')}
                </span>
                <h3 className="font-[family-name:var(--iti-head)] text-[0.95rem] font-extrabold tracking-[0.08em] text-[var(--iti-navy)] uppercase">
                  {g.title[lang]}
                </h3>
              </div>
              <ul className="mt-5 space-y-3">
                {g.items.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => requestAsset(b.asset)}
                      onPointerMove={spotlight}
                      className="iti-business-card iti-spot group relative block w-full overflow-hidden rounded-2xl border border-[var(--iti-line)] bg-white p-5 text-start"
                    >
                      <span className="relative flex h-14 items-center">
                        {b.logo ? (
                          <img
                            src={b.logo}
                            alt={`${b.name} logo`}
                            className="max-h-full max-w-[150px] object-contain object-[left_center] transition-transform duration-500 group-hover:scale-[1.04] rtl:object-[right_center]"
                            loading="lazy"
                          />
                        ) : (
                          <span className="rounded-md bg-[var(--iti-navy)] px-2.5 py-1.5 text-xs font-extrabold tracking-wider text-white">{b.monogram}</span>
                        )}
                      </span>
                      <span className="relative mt-4 block font-[family-name:var(--iti-head)] text-[1.02rem] font-bold text-[var(--iti-navy)]">{b.name}</span>
                      <span className="relative mt-0.5 block text-xs text-[var(--iti-ink-soft)]">{b.location[lang]}</span>
                      <span className="relative mt-3 block text-[0.86rem] leading-snug text-[var(--iti-navy)]/80">{b.headline[lang]}</span>
                      <span className="relative mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--iti-copper)]">
                        <span className="iti-map-dot relative h-1.5 w-1.5 rounded-full bg-[var(--iti-copper)]" aria-hidden />
                        {t.onMap[lang]}
                        <span className={`transition-transform duration-300 group-hover:translate-x-1 ${rtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} aria-hidden>
                          →
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Contact — the finale: a planet horizon rising under the last words, */
/* with Barcelona lit at its crown and lanes running out to the world  */
/* ------------------------------------------------------------------ */

function useBarcelonaTime(lang: Lang) {
  const fmt = () =>
    new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 20_000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])
  return time
}

function Horizon({ label }: { label: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const rise = useTransform(scrollYProgress, [0, 1], [90, 0])
  const glow = useTransform(scrollYProgress, [0.3, 1], [0.25, 0.7])
  const lanes = [
    'M800,352 C640,170 360,190 60,470',
    'M800,352 C960,160 1260,200 1560,460',
    'M800,352 C700,250 520,300 330,470',
    'M800,352 C900,240 1110,300 1290,470',
    'M800,352 C760,280 660,330 590,480',
  ]
  return (
    <div ref={ref} className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vw] max-h-[440px] min-h-[300px]" aria-hidden>
      <motion.svg
        viewBox="0 0 1600 500"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        style={reduce ? undefined : { y: rise }}
      >
        <defs>
          <linearGradient id="hz-body" gradientUnits="userSpaceOnUse" x1="0" y1="350" x2="0" y2="500">
            <stop offset="0" stopColor="#14567d" />
            <stop offset="0.45" stopColor="#0a3d5d" />
            <stop offset="1" stopColor="#03263c" />
          </linearGradient>
          <radialGradient id="hz-crown" cx="50%" cy="0%" r="55%">
            <stop offset="0" stopColor="#8fc4e3" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8fc4e3" stopOpacity="0" />
          </radialGradient>
          <pattern id="hz-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.15" fill="#c9dbe6" />
          </pattern>
          <linearGradient id="hz-dot-fade" gradientUnits="userSpaceOnUse" x1="0" y1="350" x2="0" y2="500">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="hz-dot-mask">
            <rect width="1600" height="500" fill="url(#hz-dot-fade)" />
          </mask>
          <clipPath id="hz-clip">
            <circle cx="800" cy="1500" r="1150" />
          </clipPath>
          <filter id="hz-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        {/* atmosphere */}
        <motion.circle cx="800" cy="1500" r="1168" fill="none" stroke="#5fa3c9" strokeWidth="30" filter="url(#hz-blur)" style={{ opacity: glow }} />
        <circle cx="800" cy="1500" r="1150" fill="url(#hz-body)" />
        <g clipPath="url(#hz-clip)">
          <rect width="1600" height="500" fill="url(#hz-dots)" mask="url(#hz-dot-mask)" opacity="0.55" />
          <rect width="1600" height="500" fill="url(#hz-crown)" />
        </g>
        <circle cx="800" cy="1500" r="1150" fill="none" stroke="#cfe8f6" strokeOpacity="0.55" strokeWidth="1.4" />
        {/* lanes leaving Barcelona */}
        {lanes.map((d, i) => (
          <g key={d}>
            <path d={d} fill="none" stroke="#d9895a" strokeOpacity="0.45" strokeWidth="1.3" />
            {!reduce && (
              <path d={d} pathLength={1} fill="none" stroke="#ffe2cc" strokeWidth="2.6" strokeLinecap="round" className="iti-comet" style={{ animationDelay: `${i * 0.7}s` }} />
            )}
          </g>
        ))}
        {/* the beacon */}
        <circle cx="800" cy="352" r="26" fill="#e39a6b" opacity="0.18" className={reduce ? undefined : 'iti-ping'} />
        <circle cx="800" cy="352" r="9" fill="#e39a6b" opacity="0.35" />
        <rect x="794" y="346" width="12" height="12" transform="rotate(45 800 352)" fill="#fff" stroke="#053552" strokeWidth="2" />
        <text x="800" y="318" textAnchor="middle" className="iti-map-label" fontSize="15" fontWeight="700">
          {label}
        </text>
      </motion.svg>
    </div>
  )
}

export function ItiContact({ lang }: { lang: Lang }) {
  const t = COPY.contact
  const rtl = lang === 'ar'
  const time = useBarcelonaTime(lang)
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${CONTACT.email}`
    }
  }

  const tiles = [
    {
      k: t.email[lang],
      v: (
        <a href={`mailto:${CONTACT.email}`} className="break-all hover:text-[var(--iti-copper-soft)]" dir="ltr">
          {CONTACT.email}
        </a>
      ),
    },
    {
      k: t.website[lang],
      v: (
        <a href={CONTACT.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--iti-copper-soft)]" dir="ltr">
          {CONTACT.website}
        </a>
      ),
    },
    {
      k: t.office[lang],
      v: (
        <span>
          {t.address[lang]}
          <span className="mt-2 flex items-center gap-2 text-[0.72rem] font-medium text-white/55">
            <span className="iti-live-dot" aria-hidden />
            {t.localTime[lang]} · <span dir="ltr">{time}</span>
          </span>
        </span>
      ),
    },
  ]

  return (
    <section id="contact" className="iti-grain iti-finale relative isolate overflow-hidden text-white">
      <div className="relative mx-auto max-w-[1100px] px-5 pt-28 pb-[max(320px,min(36vw,420px))] text-center sm:px-8 sm:pt-36">
        <Reveal>
          <p className="iti-eyebrow iti-eyebrow-light justify-center">{t.eyebrow[lang]}</p>
        </Reveal>
        <SplitReveal
          text={t.title[lang]}
          emphasis={emph(lang, 2, 1)}
          className="iti-display mx-auto mt-7 max-w-[15ch] text-[clamp(2.5rem,6vw,5.4rem)] rtl:text-[clamp(2.2rem,5vw,4.4rem)]"
        />
        <Reveal delay={0.1}>
          <p className="mx-auto mt-7 max-w-xl text-[1.05rem] leading-relaxed text-white/70">{t.body[lang]}</p>
        </Reveal>

        <Reveal delay={0.18} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <a href={`mailto:${CONTACT.email}`} className="iti-btn iti-btn-copper group">
              {t.cta[lang]}
              <Arrow rtl={rtl} />
            </a>
          </Magnetic>
          <Magnetic strength={0.18}>
            <button type="button" onClick={copyEmail} className="iti-btn iti-btn-ghost min-w-[9.5rem] justify-center" aria-live="polite">
              <motion.span key={copied ? 'y' : 'n'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2">
                {copied ? (
                  <>
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t.copied[lang]}
                  </>
                ) : (
                  t.copy[lang]
                )}
              </motion.span>
            </button>
          </Magnetic>
        </Reveal>

        <dl className="mt-14 grid gap-3 text-start sm:grid-cols-3">
          {tiles.map((tile, i) => (
            <Reveal key={tile.k} delay={0.22 + i * 0.08}>
              <div onPointerMove={spotlight} className="iti-glass-tile iti-spot iti-spot-dark h-full rounded-2xl p-5">
                <dt className="relative text-[0.66rem] font-semibold tracking-[0.2em] uppercase text-white/45">{tile.k}</dt>
                <dd className="relative mt-2 text-sm leading-relaxed font-semibold">{tile.v}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>

      <Horizon label={t.beacon[lang]} />
    </section>
  )
}

export function ItiFooter({ lang }: { lang: Lang }) {
  const t = COPY.footer
  const nav = COPY.nav
  return (
    <footer className="relative bg-[var(--iti-navy-deep)] text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <ItiLogo tone="white" layout="horizontal" className="h-[56px] w-[224px]" />
          <p className="mt-5 text-[0.72rem] font-semibold tracking-[0.22em] uppercase text-white/50">{t.tagline[lang]}</p>
        </div>
        <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/65">
          {(['about', 'vision', 'values', 'businesses', 'footprint', 'contact'] as const).map((k) => (
            <li key={k}>
              <a href={`#${k}`} className="iti-link-underline hover:text-white">
                {nav[k][lang]}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <p className="text-xs text-white/45">{t.rights[lang]}</p>
          <Magnetic strength={0.3}>
            <a
              href="#top"
              aria-label={t.top[lang]}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-[var(--iti-copper-soft)] hover:text-white"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden>
                <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Magnetic>
        </div>
      </div>
    </footer>
  )
}
