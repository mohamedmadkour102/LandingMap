import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion'
import { Reveal } from '../../components/Reveal'
import { useCountUp } from '../../hooks/useCountUp'
import ItiLogo, { ICON_FRAME, ICON_SHAPES } from './ItiLogo'
import { Picture } from './media'
import { requestAsset } from './mapBus'
import { EASE_IN_OUT, EASE_OUT, Magnetic, SplitReveal } from './fx'
import { BUSINESS_GROUPS, CONTACT, CONTACT_FORM, COPY, INQUIRIES, type InquiryId, type Lang } from './content'

/** Words at the end of a headline that carry the copper-champagne gradient */
const emph = (lang: Lang, en: number, ar: number) => (lang === 'ar' ? ar : en)

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/** 6.5s per site; waits for the next photo to load, pauses off-screen / in a background tab, still under reduced motion */
const HERO_SLIDE_MS = 6500

function useHeroSlides(count: number, still: boolean, ref: RefObject<HTMLElement | null>) {
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState<Set<number>>(() => new Set())
  const markReady = (i: number) => setReady((r) => (r.has(i) ? r : new Set(r).add(i)))
  const visible = useRef(true)
  const readyRef = useRef(ready)
  useEffect(() => {
    readyRef.current = ready
  }, [ready])

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [ref])

  useEffect(() => {
    if (still || count < 2) return
    const next = (index + 1) % count
    let id = 0
    const tryAdvance = () => {
      if (document.hidden || !visible.current || !readyRef.current.has(next)) {
        id = window.setTimeout(tryAdvance, 600)
        return
      }
      setIndex(next)
    }
    id = window.setTimeout(tryAdvance, HERO_SLIDE_MS)
    return () => window.clearTimeout(id)
  }, [index, still, count])

  return { index, ready, markReady }
}

export function ItiHero({ lang }: { lang: Lang }) {
  const t = COPY.hero
  const rtl = lang === 'ar'
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement | null>(null)

  // scroll: the photo sinks slower than the page, the copy lifts and fades
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90])
  const copyO = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const slides = t.slides
  const { index, ready, markReady } = useHeroSlides(slides.length, !!reduce, ref)
  const slide = slides[index]

  return (
    <section id="top" ref={ref} className="iti-grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--iti-ink-deep)] text-white">
      {/* The Group's real plants and terminals, crossfading one after another */}
      <motion.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y: photoY }} aria-hidden>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: EASE_OUT }}
        >
          {slides.map((s, i) => {
            // mount the current slide plus the next one, so it has loaded before it fades in
            const mounted = i === index || i === (index + 1) % slides.length || ready.has(i)
            if (!mounted) return null
            const on = i === index
            return (
              <div key={s.photo} className={`iti-hero-slide${on ? ' is-on' : ''}`}>
                <Picture
                  k={s.photo}
                  sizes="100vw"
                  priority={i === 0}
                  onLoad={() => markReady(i)}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: s.pos }}
                />
              </div>
            )
          })}
        </motion.div>
      </motion.div>
      {/* light corporate scrim: deep only behind the copy, the plants stay clear on the far side */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(${rtl ? '255deg' : '105deg'}, rgba(2,26,43,0.58) 0%, rgba(3,38,60,0.38) 34%, rgba(5,53,82,0.1) 62%, rgba(5,53,82,0) 100%)`,
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[rgb(5_53_82/0.04)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[var(--iti-ink-deep)]/50 to-transparent" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-[var(--iti-ink-deep)]/28 to-transparent" />

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
          className="mt-7 max-w-xl text-[1.06rem] leading-relaxed text-white/85 [text-shadow:0_1px_12px_rgb(2_26_43/0.5)] sm:text-lg"
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

      <motion.div
        className="absolute end-5 bottom-24 hidden sm:end-8 md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={slide.photo}
            className="iti-photo-caption text-white/75 [text-shadow:0_1px_8px_rgb(2_26_43/0.55)]"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            {slide.caption[lang]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

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
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
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
/* About — one Mist Gray band: headline and lead, the Group in five    */
/* figures, the mark as living copper geometry, then the three pillars */
/* ------------------------------------------------------------------ */

/** The icon in copper outline: draws itself, one champagne sweep runs the stroke, a faint glow settles behind the roof */
function AboutMark({
  reduce,
  sectionRef,
  px,
  py,
}: {
  reduce: boolean
  sectionRef: RefObject<HTMLElement | null>
  px: MotionValue<number>
  py: MotionValue<number>
}) {
  const [drawn, setDrawn] = useState(false)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const drift = useTransform(scrollYProgress, [0, 0.5, 1], [36, 0, -36])
  return (
    <motion.div
      className="pointer-events-none relative ms-auto mb-8 h-32 w-fit sm:h-44 lg:absolute lg:end-8 lg:top-0 lg:mb-0 lg:h-[360px] xl:end-16 xl:h-[400px]"
      style={reduce ? undefined : { y: drift }}
      onViewportEnter={() => setDrawn(true)}
      viewport={{ once: true, margin: '-10% 0px' }}
      aria-hidden
    >
      <motion.div className={`iti-mark relative h-full ${drawn || reduce ? 'is-drawn' : ''}`} style={reduce ? undefined : { x: px, y: py }}>
        {/* ambient warmth behind the roof */}
        <span className="iti-mark-glow absolute start-[8%] top-[-6%] h-[62%] w-[84%] rounded-full blur-2xl [background:radial-gradient(closest-side,rgb(212_137_95/0.22),transparent)]" />
        <svg viewBox={ICON_FRAME} className="relative h-full w-auto overflow-visible" fill="none">
          <g className="iti-mark-base" stroke="var(--iti-copper)" strokeOpacity={0.6} strokeWidth={1.3} strokeLinejoin="miter">
            {ICON_SHAPES.map((p) => (
              <polygon key={p.slice(0, 12)} points={p} pathLength={1} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <g className="iti-mark-sweep" stroke="#f0c9a2" strokeWidth={2.4} strokeLinecap="round">
            {ICON_SHAPES.map((p) => (
              <polygon key={p.slice(0, 12)} points={p} pathLength={1} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  )
}

/** Count-up driven by the strip's own reveal (reduced motion: the final value, at once) */
function StatCount({ value, start, still }: { value: number; start: boolean; still: boolean }) {
  const n = useCountUp(value, 1600, start && !still)
  return <>{(still ? value : n).toLocaleString()}</>
}

const stripParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}
const stripItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}
const lineX: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.2, ease: EASE_OUT } },
}
const lineY: Variants = {
  hidden: { scaleY: 0 },
  show: {
    scaleY: 1,
    transition: { duration: 0.9, ease: EASE_OUT, delay: 0.25 },
  },
}

const pillarParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16 } },
}
const pillarRule: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE_OUT } },
}
const pillarNum: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT, delay: 0.3 },
  },
}
const pillarTitle: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.4 },
  },
}
const pillarBody: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.62 },
  },
}

export function ItiAbout({ lang }: { lang: Lang }) {
  const t = COPY.about
  const reduce = !!useReducedMotion()
  const ref = useRef<HTMLElement | null>(null)
  // desktop only: the mark leans very slightly against the cursor
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 50, damping: 18 })
  const py = useSpring(my, { stiffness: 50, damping: 18 })
  const anim = reduce ? false : 'hidden'
  // the figures count up as the strip itself animates in, so a resting "0" is never on screen
  const [counted, setCounted] = useState(false)
  const n = COPY.stats.length
  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden bg-[var(--iti-mist)] py-24 sm:py-32"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== 'mouse' || window.innerWidth < 1024) return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(((e.clientX - r.left) / r.width - 0.5) * -14)
        my.set(((e.clientY - r.top) / r.height - 0.5) * -10)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* headline block; on desktop the mark lives beside it, sized to it, so it never reaches the figures */}
        <div className="relative lg:min-h-[360px] xl:min-h-[400px]">
          <AboutMark reduce={reduce} sectionRef={ref} px={px} py={py} />
          <div className="relative lg:max-w-[66%]">
            <Reveal>
              <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
            </Reveal>
            <SplitReveal text={t.title[lang]} emphasis={emph(lang, 3, 2)} className="iti-h2 iti-about-title mt-5" />
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-[56ch] text-[1.06rem] leading-[1.8] text-[var(--iti-ink-soft)] sm:text-[1.12rem]">{t.lead[lang]}</p>
            </Reveal>
          </div>
        </div>

        {/* the Group at a glance — the hairlines draw in, the figures follow one by one */}
        <motion.dl
          className="relative mt-16 grid grid-cols-2 sm:mt-20 lg:grid-cols-5"
          variants={stripParent}
          initial={anim}
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          onViewportEnter={() => setCounted(true)}
        >
          <motion.span variants={lineX} className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--iti-line)] rtl:origin-right" aria-hidden />
          <motion.span variants={lineX} className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--iti-line)] rtl:origin-right" aria-hidden />
          {COPY.stats.map((s, i) => (
            <motion.div
              key={s.label.en}
              variants={stripItem}
              className={`group relative flex flex-col py-7 sm:py-9 ${i % 2 === 0 ? 'pe-4' : 'ps-5'} lg:px-7 lg:first:ps-0 lg:last:pe-0 ${
                i === n - 1 ? 'col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* dividers: between columns, and between rows on phones */}
              {i > 0 && (
                <motion.span
                  variants={lineY}
                  className={`absolute inset-y-5 start-0 w-px origin-top bg-[var(--iti-line)] ${i % 2 === 1 ? '' : 'hidden lg:block'}`}
                  aria-hidden
                />
              )}
              {i >= 2 && (
                <motion.span
                  variants={lineX}
                  className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--iti-line)] lg:hidden rtl:origin-right"
                  aria-hidden
                />
              )}
              <dt className="order-last mt-3 text-[0.84rem] leading-snug font-medium text-[var(--iti-ink-soft)] transition-colors duration-300 group-hover:text-[var(--iti-navy)]">
                {s.label[lang]}
              </dt>
              <dd
                className="relative w-fit pb-2 font-[family-name:var(--iti-head)] text-[clamp(2.1rem,3.2vw,3rem)] leading-none font-extrabold tracking-tight text-[var(--iti-navy)] transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1"
                dir="ltr"
              >
                <span className="text-[var(--iti-copper)]">{s.prefix}</span>
                <StatCount value={s.value} start={counted} still={reduce} />
                <span className="text-[var(--iti-copper)]">{s.suffix}</span>
                {/* copper underline grows under the figure in focus */}
                <span
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--iti-copper)] transition-transform duration-500 ease-out motion-safe:group-hover:scale-x-100"
                  aria-hidden
                />
              </dd>
            </motion.div>
          ))}
        </motion.dl>

        {/* the pillars, on the same Mist band — the rules draw, the numbers tick in, the words follow */}
        <div className="mt-20 grid gap-10 sm:mt-28 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <h3 className="font-[family-name:var(--iti-head)] text-[clamp(1.7rem,2.6vw,2.3rem)] leading-tight font-extrabold tracking-tight text-[var(--iti-navy)]">
              {t.definesTitle[lang]}
            </h3>
          </Reveal>
          <motion.ol
            className="grid gap-10 sm:grid-cols-3 sm:gap-8 lg:col-span-8"
            variants={pillarParent}
            initial={anim}
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {t.pillars.map((p, i) => (
              <motion.li key={p.title.en} className="iti-pillar group relative pt-6" variants={{ hidden: {}, show: {} }}>
                <motion.span
                  variants={pillarRule}
                  className="iti-pillar-rule absolute inset-x-0 top-0 h-[2px] origin-left bg-[var(--iti-copper)] rtl:origin-right"
                  aria-hidden
                />
                <div className="transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1">
                  <motion.span
                    variants={pillarNum}
                    className="block text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--iti-copper)] rtl:text-right"
                    dir="ltr"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>
                  <motion.h4
                    variants={pillarTitle}
                    className="mt-3 font-[family-name:var(--iti-head)] text-[1.08rem] leading-snug font-bold text-[var(--iti-navy)]"
                  >
                    {p.title[lang]}
                  </motion.h4>
                  <motion.p variants={pillarBody} className="mt-2.5 text-[0.95rem] leading-[1.7] text-[var(--iti-ink-soft)]">
                    {p.body[lang]}
                  </motion.p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Vision & Mission — "Our Purpose": today's mission, tomorrow's      */
/* vision, beside sweeping navy ribbons lit along their copper edges   */
/* ------------------------------------------------------------------ */

/* ribbon edges, bottom-left → top-right (viewBox 0 0 800 1000) */
const RIBBON_EDGES = [
  { a: [250, 1000], c1: [300, 640], c2: [520, 300], b: [800, 40] },
  { a: [380, 1000], c1: [420, 700], c2: [600, 420], b: [800, 250] },
  { a: [500, 1000], c1: [540, 780], c2: [660, 600], b: [800, 480] },
  { a: [620, 1000], c1: [650, 880], c2: [720, 780], b: [800, 720] },
] as const
type Edge = (typeof RIBBON_EDGES)[number]
const fwd = (e: Edge) => `M${e.a} C${e.c1} ${e.c2} ${e.b}`
const band = (e: Edge, f: Edge) => `${fwd(e)} L${f.b} C${f.c2} ${f.c1} ${f.a} Z`

/** Abstract architecture in brand colours — built in SVG, so it is crisp, light, mirrored for Arabic and animatable */
function PurposeRibbons({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [lit, setLit] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const E = RIBBON_EDGES
  return (
    <motion.div
      ref={ref}
      className={`iti-ribbons pointer-events-none absolute inset-y-0 end-0 -z-10 w-full opacity-45 sm:w-[80%] lg:w-[48%] lg:opacity-100 ${lit || reduce ? 'is-lit' : ''}`}
      style={reduce ? undefined : { y }}
      onViewportEnter={() => setLit(true)}
      viewport={{ once: true, margin: '-15% 0px' }}
      aria-hidden
    >
      <svg viewBox="0 0 800 1000" preserveAspectRatio="xMaxYMid slice" className="h-full w-full rtl:-scale-x-100">
        <defs>
          <linearGradient id="rb-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14507a" />
            <stop offset="0.55" stopColor="#082f4a" />
            <stop offset="1" stopColor="#03192a" />
          </linearGradient>
          <linearGradient id="rb-edge" gradientUnits="userSpaceOnUse" x1="250" y1="1000" x2="800" y2="0">
            <stop offset="0" stopColor="#c27448" stopOpacity="0" />
            <stop offset="0.3" stopColor="#c27448" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#f3d3b2" stopOpacity="0.95" />
            <stop offset="0.78" stopColor="#e39a6b" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e39a6b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rb-floor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e39a6b" stopOpacity="0" />
            <stop offset="0.45" stopColor="#f3d3b2" stopOpacity="0.7" />
            <stop offset="1" stopColor="#e39a6b" stopOpacity="0" />
          </linearGradient>
          {/* fine vertical fluting, like the cladding of a facade */}
          <pattern id="rb-flute" width="7" height="10" patternUnits="userSpaceOnUse">
            <rect width="1" height="10" fill="#ffffff" opacity="0.045" />
          </pattern>
          <filter id="rb-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="rb-wash" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          {E.slice(0, 3).map((e, i) => (
            <clipPath key={i} id={`rb-clip-${i}`}>
              <path d={band(e, E[i + 1])} />
            </clipPath>
          ))}
        </defs>

        {/* faces */}
        {E.slice(0, 3).map((e, i) => (
          <g key={i} className="iti-ribbon-face" style={{ transitionDelay: `${0.15 * i}s` }}>
            <path d={band(e, E[i + 1])} fill="url(#rb-face)" opacity={0.95 - i * 0.12} />
            <path d={band(e, E[i + 1])} fill="url(#rb-flute)" />
            {/* copper light spilling from the lit edge onto the face */}
            <g clipPath={`url(#rb-clip-${i})`}>
              <path d={fwd(e)} stroke="url(#rb-edge)" strokeWidth={70} fill="none" filter="url(#rb-wash)" opacity={0.42} />
            </g>
          </g>
        ))}
        <path d={`${fwd(E[3])} L800 1000 Z`} fill="#03192a" className="iti-ribbon-face" />

        {/* copper light along the leading edges — a soft bloom under a crisp line */}
        {E.map((e, i) => (
          <g key={i}>
            <path d={fwd(e)} className="iti-ribbon-edge" stroke="url(#rb-edge)" strokeWidth={7} fill="none" filter="url(#rb-glow)" opacity={0.55} pathLength={1} style={{ animationDelay: `${0.35 + i * 0.18}s` }} />
            <path d={fwd(e)} className="iti-ribbon-edge" stroke="url(#rb-edge)" strokeWidth={1.6} fill="none" pathLength={1} style={{ animationDelay: `${0.35 + i * 0.18}s` }} />
          </g>
        ))}

        {/* light grazing the floor */}
        <path d="M0 965 Q 380 905 800 940" className="iti-ribbon-edge" stroke="url(#rb-floor)" strokeWidth={1.4} fill="none" pathLength={1} style={{ animationDelay: '1.1s' }} />
      </svg>
    </motion.div>
  )
}

function MissionIcon() {
  // three stacked plates — building and operating, layer on layer
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 text-[var(--iti-copper-soft)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
      <path d="M20 6 34 13 20 20 6 13Z" />
      <path d="M6 19.5 20 26.5 34 19.5" />
      <path d="M6 26 20 33 34 26" />
    </svg>
  )
}

function VisionIcon() {
  // a horizon with a path rising towards it
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 text-[var(--iti-copper-soft)]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 30h32" />
      <path d="M8 30c4-7 9-11 16-13" />
      <path d="M20 13.5 25 16.6 22 21.4" />
      <circle cx="31" cy="11" r="3.2" />
    </svg>
  )
}

export function ItiVision({ lang }: { lang: Lang }) {
  const p = COPY.purpose
  const reduce = !!useReducedMotion()
  const blocks = [
    { key: 'mission', t: COPY.mission, Icon: MissionIcon },
    { key: 'vision', t: COPY.vision, Icon: VisionIcon },
  ] as const
  return (
    <section id="vision" className="iti-grain iti-purpose relative isolate overflow-hidden py-24 text-white sm:py-32 lg:py-40">
      <PurposeRibbons reduce={reduce} />
      {/* keeps the copy side calm on narrow screens, where the ribbons sit behind the text */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(3_30_48/0.92)_0%,rgb(3_30_48/0.55)_60%,transparent_100%)] lg:hidden rtl:bg-[linear-gradient(270deg,rgb(3_30_48/0.92)_0%,rgb(3_30_48/0.55)_60%,transparent_100%)]" />

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="lg:max-w-[62%]">
          <Reveal>
            <p className="iti-eyebrow iti-eyebrow-light">{p.eyebrow[lang]}</p>
          </Reveal>
          <SplitReveal text={p.title[lang]} emphasis={emph(lang, 3, 3)} className="iti-purpose-title mt-6" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[48ch] text-[1.08rem] leading-relaxed text-white/70 sm:text-[1.15rem]">{p.lead[lang]}</p>
          </Reveal>

          <div className="relative mt-14 grid gap-12 sm:mt-16 sm:grid-cols-2 sm:gap-0">
            {/* hairline between the two statements */}
            <motion.span
              className="absolute inset-y-2 start-1/2 hidden w-px origin-top bg-white/18 sm:block"
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.3 }}
              aria-hidden
            />
            {blocks.map(({ key, t, Icon }, i) => (
              <motion.div
                key={key}
                className={i === 0 ? 'sm:pe-10 lg:pe-12' : 'sm:ps-10 lg:ps-12'}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 + i * 0.18 }}
              >
                <div className="flex items-center gap-4">
                  <Icon />
                  <p className="text-[0.74rem] font-semibold tracking-[0.22em] text-white/90 uppercase rtl:tracking-normal">{t.eyebrow[lang]}</p>
                </div>
                <h3 className="mt-6 font-[family-name:var(--iti-head)] text-[clamp(1.45rem,2.2vw,2rem)] leading-[1.2] font-bold tracking-[-0.01em] text-white">
                  {t.headline[lang]}
                </h3>
                <p className="mt-4 max-w-[40ch] text-[1rem] leading-[1.7] text-white/65">{t.body[lang]}</p>
              </motion.div>
            ))}
          </div>

          <motion.span
            className="mt-16 block h-[2px] w-20 origin-left bg-[var(--iti-copper-soft)] rtl:origin-right"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.6 }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Values — six principles strung on one rising copper line. A spark   */
/* runs it on arrival; pointing at (or focusing) a principle lights    */
/* the line up to it. On phones it becomes a timeline filled by scroll */
/* ------------------------------------------------------------------ */

const VALUE_ICONS: Record<string, ReactNode> = {
  // a shield with a check — trust that holds
  integrity: (
    <>
      <path d="M12 3 19 6v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6Z" />
      <path d="m8.8 12.2 2.3 2.3 4.2-4.6" />
    </>
  ),
  // a medal on its ribbons
  excellence: (
    <>
      <circle cx="12" cy="9" r="5.2" />
      <path d="m12 6.6.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7-1.3-1.2 1.7-.2Z" />
      <path d="M8.6 13.2 7 21l5-2.6 5 2.6-1.6-7.8" />
    </>
  ),
  // two links joined
  integration: (
    <>
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3.1-3.1a3.6 3.6 0 0 0-5.1-5.1l-1.2 1.2" />
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3.1 3.1a3.6 3.6 0 0 0 5.1 5.1l1.2-1.2" />
    </>
  ),
  // a bulb with its light
  innovation: (
    <>
      <path d="M9.2 16.5h5.6M9.8 19.5h4.4" />
      <path d="M12 6.5a4.7 4.7 0 0 0-2.8 8.5c.5.4.7.9.7 1.5h4.2c0-.6.2-1.1.7-1.5A4.7 4.7 0 0 0 12 6.5Z" />
      <path d="M12 2.5v1.6M5.2 5.2l1.1 1.1M18.8 5.2l-1.1 1.1M2.8 11.6h1.6M19.6 11.6h1.6" />
    </>
  ),
  // a leaf with its vein
  sustainability: (
    <>
      <path d="M5 19c0-8 5.5-13.5 14-14 .4 8.6-5 14-12.4 14Z" />
      <path d="M5 19c3-4.2 6.2-7.2 10-9.4" />
    </>
  ),
  // rising bars with an arrow
  'value-creation': (
    <>
      <path d="M5 20v-4M9.5 20v-6.5M14 20v-9M18.5 20V9" />
      <path d="m4.5 11.5 5-4.2 3.2 2.4 6.3-5.2" />
      <path d="M15.5 4.5H19V8" />
    </>
  ),
}

function ValueIcon({ id, className = '' }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {VALUE_ICONS[id]}
    </svg>
  )
}

/* the line, in a 1200×240 frame: a lead-in, the six nodes rising like a wave, a lead-out */
const VP_W = 1200
const VP_H = 240
const VP_NODE_Y = [168, 112, 146, 92, 104, 48]
const vpPoints = (n: number) => [
  [0, 222] as const,
  ...Array.from({ length: n }, (_, i) => [((i + 0.5) / n) * VP_W, VP_NODE_Y[i % VP_NODE_Y.length]] as const),
  [VP_W, 30] as const,
]
/** Catmull-Rom through the points, as cubic Béziers; `upto` stops at that point */
function vpPath(pts: readonly (readonly [number, number])[], upto = pts.length - 1) {
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < upto; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`
  }
  return d
}

function ValuesPath({ lang, reduce }: { lang: Lang; reduce: boolean }) {
  const items = COPY.values.items
  const n = items.length
  const rtl = lang === 'ar'
  const pts = vpPoints(n)
  const d = vpPath(pts)
  const fillRef = useRef<SVGPathElement | null>(null)
  const glowRef = useRef<SVGPathElement | null>(null)
  const sparkRef = useRef<HTMLSpanElement | null>(null)
  const measureRef = useRef<SVGPathElement | null>(null)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const [geo, setGeo] = useState<{ total: number; at: number[] } | null>(null)
  const [arrived, setArrived] = useState(false)
  const [reached, setReached] = useState(reduce ? n : -1)
  const [active, setActive] = useState<number | null>(null)
  const len = useMotionValue(0)

  // measure the line once: its length, and how far along it each node sits
  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const total = el.getTotalLength()
    const at = items.map((_, i) => {
      el.setAttribute('d', vpPath(pts, i + 1))
      return el.getTotalLength()
    })
    el.setAttribute('d', d)
    setGeo({ total, at })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  // the lit portion of the line and the spark both follow `len`
  useMotionValueEvent(len, 'change', (l) => {
    if (!geo) return
    fillRef.current?.style.setProperty('stroke-dashoffset', String(geo.total - l))
    glowRef.current?.style.setProperty('stroke-dashoffset', String(geo.total - l))
    const el = measureRef.current
    const s = sparkRef.current
    if (el && s) {
      const pt = el.getPointAtLength(Math.max(0, Math.min(geo.total, l)))
      const x = (pt.x / VP_W) * 100
      s.style.left = `${rtl ? 100 - x : x}%`
      s.style.top = `${(pt.y / VP_H) * 100}%`
    }
    setReached(geo.at.filter((a) => a <= l + 1).length - 1)
  })

  // on arrival: the spark runs the whole line once; afterwards it follows the principle in focus
  useEffect(() => {
    if (!geo) return
    if (reduce) {
      len.jump(geo.total)
      return
    }
    if (!arrived) return
    const target = active == null ? geo.total : geo.at[active]
    const c = animate(len, target, { duration: active == null && len.get() === 0 ? 3.4 : 0.9, ease: EASE_IN_OUT, delay: len.get() === 0 ? 1 : 0 })
    return () => c.stop()
  }, [geo, arrived, active, reduce, len])

  const focusAt = (i: number) => {
    const j = (i + n) % n
    btns.current[j]?.focus()
  }

  return (
    <motion.div
      className="relative hidden lg:block"
      onViewportEnter={() => setArrived(true)}
      viewport={{ once: true, margin: '-15% 0px' }}
      onPointerLeave={() => setActive(null)}
    >
      <div className="relative" style={{ height: VP_H }}>
        <svg viewBox={`0 0 ${VP_W} ${VP_H}`} preserveAspectRatio="none" className={`absolute inset-0 h-full w-full overflow-visible ${rtl ? '-scale-x-100' : ''}`} aria-hidden>
          <defs>
            <linearGradient id="vp-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d4895f" stopOpacity="0.2" />
              <stop offset="0.15" stopColor="#c27448" />
              <stop offset="0.6" stopColor="#e39a6b" />
              <stop offset="1" stopColor="#f0c9a2" />
            </linearGradient>
            <filter id="vp-glow" x="-5%" y="-40%" width="110%" height="180%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <path ref={measureRef} d={d} fill="none" stroke="none" />
          {/* the whole route, faint */}
          <path d={d} className={`iti-vp-base ${arrived || reduce ? 'is-drawn' : ''}`} fill="none" stroke="rgb(169 97 58 / 0.28)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" pathLength={1} />
          {/* the lit route: glow + crisp line, dash-revealed up to `len` */}
          {geo && (
            <>
              <path d={d} fill="none" stroke="url(#vp-fill)" strokeWidth={6} opacity={0.45} filter="url(#vp-glow)" strokeDasharray={geo.total} style={{ strokeDashoffset: reduce ? 0 : geo.total }} ref={glowRef} />
              <path ref={fillRef} d={d} fill="none" stroke="url(#vp-fill)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeDasharray={geo.total} style={{ strokeDashoffset: reduce ? 0 : geo.total }} />
            </>
          )}
        </svg>
        {!reduce && <span ref={sparkRef} className="iti-vp-spark" style={{ left: rtl ? '100%' : '0%', top: `${(222 / VP_H) * 100}%` }} aria-hidden />}

        {items.map((v, i) => {
          const x = ((i + 0.5) / n) * 100
          const on = active === i
          return (
            <div
              key={v.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${rtl ? 100 - x : x}%`, top: `${(VP_NODE_Y[i] / VP_H) * 100}%` }}
            >
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                animate={arrived || reduce ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.5 + i * 0.12 }}
              >
                <Magnetic strength={0.22}>
                  <button
                    ref={(el) => {
                      btns.current[i] = el
                    }}
                    type="button"
                    className={`iti-vnode ${reached >= i ? 'is-reached' : ''} ${on ? 'is-active' : ''}`}
                    aria-pressed={on}
                    aria-describedby={`value-${v.id}`}
                    aria-label={v.title[lang]}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(on ? null : i)}
                    onKeyDown={(e) => {
                      const next = rtl ? 'ArrowLeft' : 'ArrowRight'
                      const prev = rtl ? 'ArrowRight' : 'ArrowLeft'
                      if (e.key === next) {
                        e.preventDefault()
                        focusAt(i + 1)
                      }
                      if (e.key === prev) {
                        e.preventDefault()
                        focusAt(i - 1)
                      }
                      if (e.key === 'Escape') setActive(null)
                    }}
                  >
                    <ValueIcon id={v.id} className="h-11 w-11" />
                  </button>
                </Magnetic>
              </motion.div>
            </div>
          )
        })}
      </div>

      <ol className="mt-10 grid grid-cols-6">
        {items.map((v, i) => {
          const dim = active != null && active !== i
          return (
            <motion.li
              key={v.id}
              id={`value-${v.id}`}
              className="relative px-4 text-center xl:px-6"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={arrived || reduce ? { opacity: dim ? 0.4 : 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: arrived && active == null && reached < 0 ? 0.9 + i * 0.1 : 0 }}
              onPointerEnter={() => setActive(i)}
            >
              {i > 0 && <span className="absolute inset-y-1 start-0 w-px bg-[var(--iti-line)]" aria-hidden />}
              <h3
                className={`font-[family-name:var(--iti-head)] text-[0.92rem] font-extrabold tracking-[0.14em] uppercase transition-colors duration-300 rtl:text-[1.05rem] rtl:tracking-normal ${
                  active === i ? 'text-[var(--iti-copper)]' : 'text-[var(--iti-navy)]'
                }`}
              >
                {v.title[lang]}
              </h3>
              <p className="mt-3 text-[0.9rem] leading-[1.65] text-[var(--iti-ink-soft)]">{v.body[lang]}</p>
            </motion.li>
          )
        })}
      </ol>
    </motion.div>
  )
}

/** Phones and tablets: a vertical timeline whose copper line fills as you read down it */
function ValuesTimeline({ lang, reduce }: { lang: Lang; reduce: boolean }) {
  const items = COPY.values.items
  const n = items.length
  const ref = useRef<HTMLOListElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.6'] })
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  const [reached, setReached] = useState(reduce ? n : -1)
  const [active, setActive] = useState<number | null>(null)
  useMotionValueEvent(fill, 'change', (p) => !reduce && setReached(Math.floor(p * (n - 1) + 0.15)))
  return (
    <ol ref={ref} className="relative lg:hidden">
      {/* the line runs through the centres of the nodes */}
      <span className="absolute top-8 bottom-8 start-8 w-px bg-[rgb(169_97_58/0.25)]" aria-hidden />
      <motion.span
        className="absolute top-8 bottom-8 start-8 w-[2px] origin-top -translate-x-[0.5px] bg-gradient-to-b from-[var(--iti-copper)] to-[#f0c9a2] rtl:translate-x-[0.5px]"
        style={reduce ? undefined : { scaleY: fill }}
        aria-hidden
      />
      {items.map((v, i) => (
        <li key={v.id} className="relative flex gap-6 py-5">
          <button
            type="button"
            className={`iti-vnode iti-vnode-sm shrink-0 ${reached >= i ? 'is-reached' : ''} ${active === i ? 'is-active' : ''}`}
            aria-pressed={active === i}
            aria-describedby={`value-m-${v.id}`}
            aria-label={v.title[lang]}
            onClick={() => setActive(active === i ? null : i)}
          >
            <ValueIcon id={v.id} className="h-8 w-8" />
          </button>
          <div id={`value-m-${v.id}`} className="pt-2">
            <h3
              className={`font-[family-name:var(--iti-head)] text-[0.95rem] font-extrabold tracking-[0.12em] uppercase transition-colors duration-300 rtl:text-[1.05rem] rtl:tracking-normal ${
                active === i || reached === i ? 'text-[var(--iti-copper)]' : 'text-[var(--iti-navy)]'
              }`}
            >
              {v.title[lang]}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-[1.65] text-[var(--iti-ink-soft)]">{v.body[lang]}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ItiValues({ lang }: { lang: Lang }) {
  const t = COPY.values
  const reduce = !!useReducedMotion()
  return (
    <section id="values" className="iti-values relative isolate overflow-hidden py-24 sm:py-32">
      {/* soft paper sheets sweeping across the Mist Gray, a thread of copper light along the lower one */}
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full rtl:-scale-x-100" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="vb-sheet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="vb-thread" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e39a6b" stopOpacity="0" />
            <stop offset="0.45" stopColor="#e39a6b" stopOpacity="0.7" />
            <stop offset="1" stopColor="#e39a6b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M1000 0C1180 120 1380 160 1600 150V0Z" fill="url(#vb-sheet)" />
        <path d="M1150 0C1260 70 1420 100 1600 96" fill="none" stroke="#fff" strokeOpacity="0.8" />
        <path d="M0 760C260 720 520 760 760 900H0Z" fill="url(#vb-sheet)" opacity="0.8" />
        <path d="M0 790C240 755 470 790 690 900" fill="none" stroke="url(#vb-thread)" strokeWidth="1.4" />
      </svg>

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="max-w-[760px]">
          <Reveal>
            <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
          </Reveal>
          <SplitReveal text={t.title[lang]} emphasis={emph(lang, 1, 1)} className="iti-h2 iti-values-title mt-5" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[58ch] text-[1.06rem] leading-[1.75] text-[var(--iti-ink-soft)] sm:text-[1.12rem]">{t.lead[lang]}</p>
          </Reveal>
        </div>

        <div className="mt-14 lg:mt-16">
          <ValuesPath lang={lang} reduce={reduce} />
          <ValuesTimeline lang={lang} reduce={reduce} />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Our businesses — nine logos on a hairline grid, read in sector      */
/* order (row by row along the value chain). Each opens its site on    */
/* the globe below; the sector tabs bring one part of the chain forward */
/* ------------------------------------------------------------------ */

/** each logo's box, so differently shaped marks carry the same optical weight */
const LOGO_BOX: Record<string, string> = {
  amreyah: 'h-[58%] w-[46%]',
  bmic: 'h-[40%] w-[42%]',
  'royal-elminya': 'h-[40%] w-[64%]',
  cleopatra: 'h-[52%] w-[50%]',
  cyprometal: 'h-[56%] w-[40%]',
  ventura: 'h-[38%] w-[58%]',
  european: 'h-[58%] w-[40%]',
  sesco: 'h-[58%] w-[38%]',
  'royal-eu': 'h-[40%] w-[64%]',
}

function PinIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <path d="M8 14.5s4.8-4.4 4.8-8.1a4.8 4.8 0 0 0-9.6 0c0 3.7 4.8 8.1 4.8 8.1Z" />
      <circle cx="8" cy="6.4" r="1.7" />
    </svg>
  )
}

export function ItiBusinesses({ lang }: { lang: Lang }) {
  const t = COPY.businesses
  const rtl = lang === 'ar'
  const reduce = !!useReducedMotion()
  const [sector, setSector] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const cells = BUSINESS_GROUPS.flatMap((g) => g.items.map((b) => ({ b, g })))
  const hoverSector = hover ? cells.find((c) => c.b.id === hover)?.g.id : null
  return (
    <section id="businesses" className="iti-businesses relative py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        {/* heading: statement and context, split by a hairline */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,0.9fr)] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
            </Reveal>
            <SplitReveal text={t.title[lang]} emphasis={emph(lang, 3, 3)} className="iti-h2 iti-biz-title mt-5" />
          </div>
          <span className="hidden h-24 w-px self-center bg-[var(--iti-line)] lg:block" aria-hidden />
          <Reveal delay={0.1}>
            <p className="max-w-[46ch] text-[1.05rem] leading-[1.75] text-[var(--iti-ink-soft)]">{t.body[lang]}</p>
          </Reveal>
        </div>

        {/* sectors — the classification, as quiet tabs */}
        <Reveal delay={0.1} className="mt-14 sm:mt-16">
          <div role="group" aria-label={t.filterLabel[lang]} className="flex flex-wrap gap-x-7 gap-y-2">
            {[{ id: null as string | null, title: t.all }, ...BUSINESS_GROUPS.map((g) => ({ id: g.id as string | null, title: g.title }))].map((s) => {
              const on = sector === s.id
              const hinted = !on && s.id != null && hoverSector === s.id
              return (
                <button
                  key={s.id ?? 'all'}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSector(s.id)}
                  className={`iti-sector-tab ${on ? 'is-on' : ''} ${hinted ? 'is-hinted' : ''}`}
                >
                  {s.title[lang]}
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* the grid */}
        <motion.ul
          className="iti-biz-grid mt-6 grid grid-cols-2 lg:grid-cols-3"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          onPointerLeave={() => setHover(null)}
        >
          {cells.map(({ b, g }, i) => {
            const off = sector != null && sector !== g.id
            return (
              <motion.li
                key={b.id}
                className={i === cells.length - 1 ? 'col-span-2 lg:col-span-1' : ''}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } } }}
              >
                <button
                  type="button"
                  onClick={() => requestAsset(b.asset)}
                  onPointerEnter={() => setHover(b.id)}
                  onFocus={() => setHover(b.id)}
                  onBlur={() => setHover(null)}
                  aria-label={`${b.name} — ${t.onMap[lang]}`}
                  className={`iti-biz-cell group ${off ? 'is-off' : ''}`}
                >
                  <span className="iti-biz-plate" aria-hidden />
                  <span className="iti-biz-meta" aria-hidden>
                    <span className="truncate">{g.title[lang]}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[var(--iti-copper)]">
                      <PinIcon className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">{t.onMap[lang]}</span>
                    </span>
                  </span>
                  <span className="iti-biz-logo">
                    <span className={`relative block ${LOGO_BOX[b.id] ?? 'h-[52%] w-[50%]'}`}>
                      {b.logo ? (
                        <img src={b.logo} alt="" className="absolute inset-0 h-full w-full object-contain" loading="lazy" draggable={false} />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center font-[family-name:var(--iti-head)] font-extrabold text-[var(--iti-navy)]">{b.monogram}</span>
                      )}
                    </span>
                    {b.id === 'royal-eu' && <span className="iti-biz-tag">EU</span>}
                  </span>
                  <span className="iti-biz-rule" aria-hidden />
                </button>
              </motion.li>
            )
          })}
        </motion.ul>

        {/* hand-off to the map */}
        <Reveal className="mt-10 flex justify-end">
          <a href="#footprint" className="iti-explore group">
            <PinIcon className="h-5 w-5 text-[var(--iti-copper)]" />
            <span className="h-6 w-px bg-[var(--iti-line)]" aria-hidden />
            <span>{t.explore[lang]}</span>
            <Arrow rtl={rtl} className="text-[var(--iti-copper)]" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Contact — the direct lines beside one white form card. The form     */
/* prepares a structured email (the site has no backend), and says so: */
/* it never claims to have delivered anything itself.                  */
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

/* ISO 3166-1 regions; names come from Intl.DisplayNames in the page's language */
const REGION_CODES =
  'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ')

function useCountries(lang: Lang) {
  const [list] = useState(() => {
    const out: Record<Lang, { code: string; name: string }[]> = { en: [], ar: [] }
    for (const l of ['en', 'ar'] as const) {
      let names: Intl.DisplayNames | null = null
      try {
        names = new Intl.DisplayNames([l], { type: 'region' })
      } catch {
        names = null
      }
      out[l] = REGION_CODES.map((code) => ({ code, name: names?.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name, l))
    }
    return out
  })
  return list[lang]
}

const INQUIRY_ICONS: Record<InquiryId, ReactNode> = {
  // stacked blocks: capital put together
  partnership: (
    <>
      <path d="M12 3.5 16 5.6v4.3L12 12 8 9.9V5.6Z" />
      <path d="M8 5.6 12 7.7l4-2.1M12 7.7V12" />
      <path d="M8 12 12 14.1v4.3L8 20.5 4 18.4v-4.3Z" />
      <path d="M4 14.1 8 16.2l4-2.1M8 16.2v4.3" />
      <path d="M16 12l4 2.1v4.3l-4 2.1-4-2.1v-4.3Z" />
      <path d="M12 14.1l4 2.1 4-2.1M16 16.2v4.3" />
    </>
  ),
  // a works building with its columns
  procurement: (
    <>
      <path d="M3.5 9.5 12 4l8.5 5.5" />
      <path d="M4.5 20h15M5.5 9.5V20M18.5 9.5V20" />
      <path d="M9 12v8M12 12v8M15 12v8" />
      <path d="M12 2.5V4" />
    </>
  ),
  // a delivery truck
  distribution: (
    <>
      <path d="M2.5 7h11v9h-11Z" />
      <path d="M13.5 10h4l3 3v3h-7" />
      <circle cx="6.5" cy="17.5" r="1.7" />
      <circle cx="17" cy="17.5" r="1.7" />
    </>
  ),
  // a speech bubble
  general: <path d="M12 4.5c4.7 0 8.5 2.9 8.5 6.6s-3.8 6.6-8.5 6.6c-.9 0-1.8-.1-2.6-.3L5 19.5l1-3.5c-1.6-1.2-2.5-2.9-2.5-4.9 0-3.7 3.8-6.6 8.5-6.6Z" />,
}

function LineIcon({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}

type FormValues = Record<string, string>
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Field({ id, label, required, error, children, className = '' }: { id: string; label: string; required?: boolean; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[0.86rem] font-semibold text-[var(--iti-navy)]">
        {label}
        {required && (
          <span className="ms-1 text-[#a3412b]" aria-hidden>
            *
          </span>
        )}
      </label>
      <div className="mt-2">{children}</div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            className="mt-1.5 text-[0.78rem] text-[#a3412b]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function InquiryForm({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const reduce = !!useReducedMotion()
  const countries = useCountries(lang)
  const [topic, setTopic] = useState<InquiryId | null>(null)
  const [values, setValues] = useState<FormValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)
  const inquiry = INQUIRIES.find((q) => q.id === topic) ?? null

  const validate = (v: FormValues, q: typeof inquiry) => {
    const e: Record<string, string> = {}
    if (!q) e.topic = f.errors.topic[lang]
    if (!v.name?.trim()) e.name = f.errors.required[lang]
    if (!v.email?.trim()) e.email = f.errors.required[lang]
    else if (!EMAIL_RE.test(v.email.trim())) e.email = f.errors.email[lang]
    const msg = v.message?.trim() ?? ''
    if (!msg) e.message = f.errors.required[lang]
    else if (msg.length < 20) e.message = f.errors.message[lang]
    return e
  }
  const set = (k: string, val: string) => {
    const next = { ...values, [k]: val }
    setValues(next)
    if (tried) setErrors(validate(next, inquiry))
  }
  const pick = (id: InquiryId) => {
    setTopic(id)
    if (tried) setErrors(validate(values, INQUIRIES.find((q) => q.id === id) ?? null))
  }

  const compose = () => {
    if (!inquiry) return { subject: '', body: '' }
    const line = (k: string, v?: string) => (v?.trim() ? `${k}: ${v.trim()}` : null)
    const country = countries.find((c) => c.code === values.country)?.name
    const body = [
      `${f.type[lang]}: ${inquiry.title[lang]}`,
      ...inquiry.fields.map((fld) => line(fld.label[lang], values[fld.id])),
      '',
      values.message?.trim() ?? '',
      '',
      '—',
      line(f.name[lang], values.name),
      line(f.company[lang], values.company),
      line(f.country[lang], country),
      line(f.email[lang], values.email),
    ]
      .filter((l) => l != null)
      .join('\n')
    const who = values.company?.trim() || values.name?.trim() || ''
    return { subject: `${inquiry.title.en}${who ? ` — ${who}` : ''}`, body }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    const errs = validate(values, inquiry)
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      formRef.current?.querySelector<HTMLElement>(first === 'topic' ? 'input[name="topic"]' : `#cf-${first}`)?.focus()
      return
    }
    const { subject, body } = compose()
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setDone(true)
  }

  const copyInquiry = async () => {
    const { subject, body } = compose()
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — the address stays on screen to copy by hand */
    }
  }

  const cls = (k: string) => `iti-input ${errors[k] ? 'is-invalid' : ''}`
  const aria = (k: string) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `cf-${k}-error` : undefined })
  const fade = reduce ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.35, ease: EASE_OUT } }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div key="done" role="status" className="py-6" {...fade}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--iti-copper)]/40 text-[var(--iti-copper)]" aria-hidden>
            <svg viewBox="0 0 16 16" className="h-4 w-4">
              <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h3 className="mt-6 font-[family-name:var(--iti-head)] text-[1.45rem] leading-snug font-bold text-[var(--iti-navy)]">{f.doneTitle[lang]}</h3>
          <p className="mt-3 max-w-[52ch] text-[0.98rem] leading-[1.7] text-[var(--iti-ink-soft)]">
            {f.doneBody[lang]}{' '}
            <a href={`mailto:${CONTACT.email}`} className="font-semibold text-[var(--iti-navy)] underline decoration-[var(--iti-copper)]/50 underline-offset-4" dir="ltr">
              {CONTACT.email}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <button type="button" onClick={copyInquiry} className="iti-btn iti-btn-outline" aria-live="polite">
              {copied ? f.copiedInquiry[lang] : f.copyInquiry[lang]}
            </button>
            <button type="button" onClick={() => setDone(false)} className="iti-text-btn">
              {f.edit[lang]}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.form key="form" ref={formRef} noValidate onSubmit={submit} {...fade}>
          <fieldset>
            <legend className="text-[0.86rem] font-semibold text-[var(--iti-navy)]">
              {f.type[lang]}
              <span className="ms-1 text-[#a3412b]" aria-hidden>
                *
              </span>
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {INQUIRIES.map((q) => (
                <label key={q.id} className={`iti-type ${topic === q.id ? 'is-on' : ''} ${errors.topic ? 'is-invalid' : ''}`}>
                  <input
                    type="radio"
                    name="topic"
                    value={q.id}
                    checked={topic === q.id}
                    onChange={() => pick(q.id)}
                    className="sr-only"
                    aria-describedby={errors.topic ? 'cf-topic-error' : undefined}
                  />
                  <span className="iti-type-dot" aria-hidden />
                  <LineIcon className="iti-type-icon h-9 w-9">{INQUIRY_ICONS[q.id]}</LineIcon>
                  <span className="mt-3 block text-center font-[family-name:var(--iti-head)] text-[0.92rem] leading-snug font-bold text-[var(--iti-navy)]">{q.title[lang]}</span>
                </label>
              ))}
            </div>
            {errors.topic && (
              <p id="cf-topic-error" className="mt-2 text-[0.78rem] text-[#a3412b]">
                {errors.topic}
              </p>
            )}
          </fieldset>

          {/* only what helps route the message — optional, and only for the type chosen */}
          <AnimatePresence initial={false}>
            {inquiry && inquiry.fields.length > 0 && (
              <motion.div
                key={inquiry.id}
                className="overflow-hidden"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={reduce ? undefined : { height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                <div className={`grid gap-5 pt-6 ${inquiry.fields.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {inquiry.fields.map((fld) => (
                    <Field key={fld.id} id={`cf-${fld.id}`} label={fld.label[lang]}>
                      <select id={`cf-${fld.id}`} value={values[fld.id] ?? ''} onChange={(e) => set(fld.id, e.target.value)} className="iti-input iti-select">
                        <option value="">{f.choose[lang]}</option>
                        {fld.options.map((o) => (
                          <option key={o.en} value={o[lang]}>
                            {o[lang]}
                          </option>
                        ))}
                      </select>
                    </Field>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field id="cf-name" label={f.name[lang]} required error={errors.name}>
              <input id="cf-name" autoComplete="name" placeholder={f.namePh[lang]} value={values.name ?? ''} onChange={(e) => set('name', e.target.value)} className={cls('name')} {...aria('name')} />
            </Field>
            <Field id="cf-email" label={f.email[lang]} required error={errors.email}>
              <input
                id="cf-email"
                type="email"
                autoComplete="email"
                dir="ltr"
                placeholder={f.emailPh[lang]}
                value={values.email ?? ''}
                onChange={(e) => set('email', e.target.value)}
                className={`${cls('email')} rtl:text-right`}
                {...aria('email')}
              />
            </Field>
            <Field id="cf-company" label={f.company[lang]}>
              <input id="cf-company" autoComplete="organization" placeholder={f.companyPh[lang]} value={values.company ?? ''} onChange={(e) => set('company', e.target.value)} className={cls('company')} />
            </Field>
            <Field id="cf-country" label={f.country[lang]}>
              <select id="cf-country" autoComplete="country" value={values.country ?? ''} onChange={(e) => set('country', e.target.value)} className={`iti-input iti-select ${values.country ? '' : 'is-empty'}`}>
                <option value="">{f.countryPh[lang]}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="cf-message" label={f.message[lang]} required error={errors.message} className="sm:col-span-2">
              <textarea
                id="cf-message"
                rows={4}
                placeholder={(inquiry ?? INQUIRIES[INQUIRIES.length - 1]).placeholder[lang]}
                value={values.message ?? ''}
                onChange={(e) => set('message', e.target.value)}
                className={`${cls('message')} min-h-[124px] resize-y py-3`}
                {...aria('message')}
              />
            </Field>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <button type="submit" className="iti-btn iti-btn-navy group shrink-0 self-start">
              {f.submit[lang]}
              <Arrow rtl={lang === 'ar'} />
            </button>
            <p className="max-w-[46ch] text-[0.78rem] leading-relaxed text-[var(--iti-ink-soft)]">{f.submitNote[lang]}</p>
          </div>
          {tried && Object.keys(errors).length > 0 && (
            <p role="alert" className="mt-4 text-[0.82rem] font-medium text-[#a3412b]">
              {f.errors.summary[lang]}
            </p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  )
}

export function ItiContact({ lang }: { lang: Lang }) {
  const t = COPY.contact
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

  const direct = [
    {
      k: t.email[lang],
      icon: (
        <>
          <path d="M3.5 6h17v12h-17Z" />
          <path d="m3.8 6.3 8.2 6.4 8.2-6.4" />
        </>
      ),
      v: (
        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <a href={`mailto:${CONTACT.email}`} className="iti-link-underline" dir="ltr">
            {CONTACT.email}
          </a>
          <button type="button" onClick={copyEmail} className="iti-text-btn" aria-live="polite">
            {copied ? t.copied[lang] : t.copy[lang]}
          </button>
        </span>
      ),
    },
    {
      k: t.office[lang],
      icon: (
        <>
          <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 0 0-13 0c0 5 6.5 11 6.5 11Z" />
          <circle cx="12" cy="10" r="2.3" />
        </>
      ),
      v: (
        <>
          <span className="block max-w-[24ch]">{t.address[lang]}</span>
          <span className="mt-1.5 block text-[0.82rem] font-normal text-[var(--iti-ink-soft)]">
            {t.localTime[lang]} · <span dir="ltr">{time}</span>
          </span>
        </>
      ),
    },
    {
      k: t.website[lang],
      icon: (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5s1.2-6.1 3.6-8.5Z" />
        </>
      ),
      v: (
        <a href={CONTACT.websiteUrl} target="_blank" rel="noopener noreferrer" className="iti-link-underline" dir="ltr">
          {CONTACT.website}
        </a>
      ),
    },
  ]

  return (
    <section id="contact" className="iti-contact relative isolate overflow-hidden py-24 sm:py-32">
      {/* the same soft paper sheets as the values section, so the page closes in its own material */}
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full rtl:-scale-x-100" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="ct-sheet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M1180 0C1300 60 1450 90 1600 88V0Z" fill="url(#ct-sheet)" />
        <path d="M0 640C220 700 380 800 470 900H0Z" fill="url(#ct-sheet)" />
        <path d="M0 700C200 760 340 840 410 900" fill="none" stroke="#fff" strokeOpacity="0.9" />
      </svg>

      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 xl:col-span-4">
          <Reveal>
            <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
          </Reveal>
          <SplitReveal text={t.title[lang]} emphasis={emph(lang, 1, 1)} className="iti-h2 iti-contact-title mt-6" />
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-[40ch] text-[1.05rem] leading-[1.75] text-[var(--iti-ink-soft)]">{t.body[lang]}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <dl className="mt-10">
              {direct.map((d, i) => (
                <div key={d.k} className={`flex gap-6 py-6 ${i > 0 ? 'border-t border-[var(--iti-line)]' : ''}`}>
                  <LineIcon className="mt-1 h-7 w-7 shrink-0 text-[var(--iti-copper)]">{d.icon}</LineIcon>
                  <div className="min-w-0">
                    <dt className="text-[0.68rem] font-bold tracking-[0.2em] text-[var(--iti-navy)] uppercase rtl:text-[0.78rem] rtl:tracking-normal">{d.k}</dt>
                    <dd className="mt-1.5 text-[1rem] leading-snug font-semibold text-[var(--iti-navy)]">{d.v}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7 xl:col-span-8 xl:ps-10">
          <div className="iti-form-card">
            <InquiryForm lang={lang} />
          </div>
        </Reveal>
      </div>
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
