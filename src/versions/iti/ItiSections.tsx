import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useInView,
  useTransform,
  type Variants,
} from 'framer-motion'
import { Reveal } from '../../components/Reveal'
import { useCountUp } from '../../hooks/useCountUp'
import { useVariant } from './variants'
import ItiLogo from './ItiLogo'
import AboutStructure from './AboutStructure'
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
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[var(--iti-navy)]/60 via-[var(--iti-navy)]/20 to-transparent" />
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
          className="iti-display mt-6 max-w-[14ch] text-[length:var(--iti-fs-hero)] rtl:max-w-[15ch] rtl:text-[clamp(2.1rem,4.4vw,4rem)]"
        />
        <motion.p
          className="mt-7 max-w-xl text-[length:var(--iti-fs-lead)] leading-relaxed text-white/85 [text-shadow:0_1px_12px_rgb(2_26_43/0.5)]"
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
        <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-6 px-5 py-5 text-[0.72rem] tracking-[0.12em] text-white/60 uppercase sm:px-8">
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
/* figures on a deep-blue plate, and the symbol as a structure          */
/* ------------------------------------------------------------------ */

/** A paragraph whose **marked** phrases read as its highlights */
function Highlights({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-[var(--iti-navy)]">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
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
  // the figures count up again every time the plate comes back into view, scrolling down or up
  const statsRef = useRef<HTMLDListElement | null>(null)
  const counted = useInView(statsRef, { margin: '-60px 0px' })
  const n = COPY.stats.length
  return (
    <section
      id="about"
      ref={ref}
      className="iti-about relative overflow-hidden py-24 sm:py-32"
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
          <AboutStructure reduce={reduce} sectionRef={ref} px={px} py={py} />
          <div className="relative lg:max-w-[66%]">
            <Reveal>
              <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
            </Reveal>
            <SplitReveal text={t.title[lang]} emphasis={emph(lang, 3, 2)} className="iti-h2 iti-about-title mt-5" />
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-[60ch] text-[length:var(--iti-fs-lead)] leading-[1.8] text-[var(--iti-ink-soft)]">
                <Highlights text={t.lead[lang]} />
              </p>
            </Reveal>
          </div>
        </div>

        {/* the Group at a glance — a deep-blue plate set into the Mist band; the figures count up every time it comes into view */}
        <motion.dl
          className="iti-stats relative mt-16 grid grid-cols-2 overflow-hidden rounded-[26px] px-6 sm:mt-20 sm:px-10 lg:grid-cols-5 lg:px-4"
          variants={stripParent}
          initial={anim}
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          ref={statsRef}
        >
          {COPY.stats.map((s, i) => (
            <motion.div
              key={s.label.en}
              variants={stripItem}
              className={`group relative flex flex-col py-8 sm:py-10 ${i % 2 === 0 ? 'pe-4' : 'ps-5'} lg:px-7 ${i === n - 1 ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              {/* dividers: between columns, and between rows on phones */}
              {i > 0 && (
                <motion.span
                  variants={lineY}
                  className={`absolute inset-y-7 start-0 w-px origin-top bg-white/14 ${i % 2 === 1 ? '' : 'hidden lg:block'}`}
                  aria-hidden
                />
              )}
              {i >= 2 && (
                <motion.span variants={lineX} className="absolute inset-x-0 top-0 h-px origin-left bg-white/14 lg:hidden rtl:origin-right" aria-hidden />
              )}
              <dt className="order-last mt-3 text-[0.84rem] leading-snug font-medium text-white/65 transition-colors duration-300 group-hover:text-white">
                {s.label[lang]}
              </dt>
              <dd
                className="relative w-fit pb-2 font-[family-name:var(--iti-head)] text-[clamp(1.85rem,2.7vw,2.5rem)] leading-none font-extrabold tracking-tight text-white transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1"
                dir="ltr"
              >
                <span className="text-[var(--iti-champagne)]">{s.prefix}</span>
                <StatCount value={s.value} start={counted} still={reduce} />
                <span className="text-[var(--iti-champagne)]">{s.suffix}</span>
                {/* copper underline grows under the figure in focus */}
                <span
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--iti-copper-soft)] transition-transform duration-500 ease-out motion-safe:group-hover:scale-x-100"
                  aria-hidden
                />
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  )
}

/* Vision & Mission lives in its own file: a pinned, scroll-driven scene */
export { ItiVision } from './ItiPurpose'

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
          <path d={d} className={`iti-vp-base ${arrived || reduce ? 'is-drawn' : ''}`} fill="none" stroke="rgb(240 201 162 / 0.22)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" pathLength={1} />
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
              {i > 0 && <span className="absolute inset-y-1 start-0 w-px bg-white/12" aria-hidden />}
              <h3
                className={`font-[family-name:var(--iti-head)] text-[0.92rem] font-extrabold tracking-[0.14em] uppercase transition-colors duration-300 rtl:text-[1.05rem] rtl:tracking-normal ${
                  active === i ? 'text-[var(--iti-copper-soft)]' : 'text-white'
                }`}
              >
                {v.title[lang]}
              </h3>
              <p className="mt-3 text-[0.9rem] leading-[1.65] text-white/65">{v.body[lang]}</p>
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
      <span className="absolute top-8 bottom-8 start-8 w-px bg-white/15" aria-hidden />
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
                active === i || reached === i ? 'text-[var(--iti-copper-soft)]' : 'text-white'
              }`}
            >
              {v.title[lang]}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-[1.65] text-white/65">{v.body[lang]}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function ItiValues({ lang }: { lang: Lang }) {
  const t = COPY.values
  const reduce = !!useReducedMotion()
  const ref = useRef<HTMLElement | null>(null)
  // the thread from Vision & Mission draws on down as the principles arrive, and turns into the eyebrow's copper rule
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.35'] })
  const thread = useSpring(scrollYProgress, { stiffness: 120, damping: 26 })
  return (
    <section id="values" ref={ref} className="iti-values relative isolate overflow-hidden pt-20 pb-24 sm:pt-24 sm:pb-32">
      {/* the night carried over from Vision & Mission: a steel glow and a copper thread low across the field */}
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full rtl:-scale-x-100" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="vb-glow" cx="0.72" cy="0.62" r="0.5">
            <stop offset="0" stopColor="#215c7e" stopOpacity="0.32" />
            <stop offset="1" stopColor="#215c7e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vb-thread" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e39a6b" stopOpacity="0" />
            <stop offset="0.45" stopColor="#e39a6b" stopOpacity="0.45" />
            <stop offset="1" stopColor="#e39a6b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#vb-glow)" />
        <path d="M1150 0C1260 70 1420 100 1600 96" fill="none" stroke="#fff" strokeOpacity="0.07" />
        <path d="M0 790C240 755 470 790 690 900" fill="none" stroke="url(#vb-thread)" strokeWidth="1.4" />
      </svg>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <motion.span
          className="iti-values-thread absolute start-[calc(1.25rem+7px)] -top-20 h-[calc(5rem+0.4rem)] w-px origin-top sm:start-[calc(2rem+7px)] sm:-top-24 sm:h-[calc(6rem+0.4rem)]"
          style={reduce ? undefined : { scaleY: thread }}
          aria-hidden
        />
        <div className="max-w-[760px]">
          <Reveal>
            <p className="iti-eyebrow iti-eyebrow-light">{t.eyebrow[lang]}</p>
          </Reveal>
          <SplitReveal text={t.title[lang]} emphasis={emph(lang, 1, 1)} className="iti-h2 iti-values-title mt-5" />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[58ch] text-[length:var(--iti-fs-lead)] leading-[1.75] text-white/70">{t.lead[lang]}</p>
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

const formFieldItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}
const formFieldsParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

function Field({ id, label, required, error, children, className = '' }: { id: string; label: string; required?: boolean; error?: string; children: ReactNode; className?: string }) {
  const reduce = !!useReducedMotion()
  const body = (
    <>
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
    </>
  )
  if (reduce) return <div className={className}>{body}</div>
  return (
    <motion.div className={className} variants={formFieldItem}>
      {body}
    </motion.div>
  )
}

function InquiryForm({ lang, preset }: { lang: Lang; preset: { id: InquiryId | null; n: number } }) {
  const f = CONTACT_FORM
  const reduce = !!useReducedMotion()
  const countries = useCountries(lang)
  const [topic, setTopic] = useState<InquiryId | null>(null)
  // a route chosen in the section opens the form already set to it; the rest of the draft is kept
  useEffect(() => {
    if (preset.id) setTopic(preset.id)
  }, [preset])
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
        <motion.div
          key="done"
          role="status"
          className="py-6"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <motion.span
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--iti-copper)]/40 text-[var(--iti-copper)]"
            aria-hidden
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4">
              <motion.path
                d="M3 8.5l3 3 7-7"
                stroke="currentColor"
                strokeWidth="1.7"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.55, ease: EASE_OUT, delay: reduce ? 0 : 0.12 }}
              />
            </svg>
          </motion.span>
          <motion.h3
            className="mt-6 font-[family-name:var(--iti-head)] text-[1.3rem] leading-snug font-bold text-[var(--iti-navy)]"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: reduce ? 0 : 0.22 }}
          >
            {f.doneTitle[lang]}
          </motion.h3>
          <motion.p
            className="mt-3 max-w-[52ch] text-[0.98rem] leading-[1.7] text-[var(--iti-ink-soft)]"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: reduce ? 0 : 0.32 }}
          >
            {f.doneBody[lang]}{' '}
            <a href={`mailto:${CONTACT.email}`} className="font-semibold text-[var(--iti-navy)] underline decoration-[var(--iti-copper)]/50 underline-offset-4" dir="ltr">
              {CONTACT.email}
            </a>
            .
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-5"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT, delay: reduce ? 0 : 0.42 }}
          >
            <button type="button" onClick={copyInquiry} className="iti-btn iti-btn-outline" aria-live="polite">
              {copied ? f.copiedInquiry[lang] : f.copyInquiry[lang]}
            </button>
            <button type="button" onClick={() => setDone(false)} className="iti-text-btn">
              {f.edit[lang]}
            </button>
          </motion.div>
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
              {INQUIRIES.map((q) => {
                const on = topic === q.id
                return (
                  <motion.label
                    key={q.id}
                    className={`iti-type ${on ? 'is-on' : ''} ${errors.topic ? 'is-invalid' : ''}`}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    animate={reduce ? undefined : on ? { scale: [1, 1.035, 1] } : { scale: 1 }}
                    transition={on && !reduce ? { type: 'spring', stiffness: 420, damping: 20, duration: 0.45 } : { duration: 0.2 }}
                  >
                    <input
                      type="radio"
                      name="topic"
                      value={q.id}
                      checked={on}
                      onChange={() => pick(q.id)}
                      className="sr-only"
                      aria-describedby={errors.topic ? 'cf-topic-error' : undefined}
                    />
                    <span className="iti-type-dot" aria-hidden />
                    <LineIcon className="iti-type-icon h-9 w-9">{INQUIRY_ICONS[q.id]}</LineIcon>
                    <span className="mt-3 block text-center font-[family-name:var(--iti-head)] text-[0.92rem] leading-snug font-bold text-[var(--iti-navy)]">{q.title[lang]}</span>
                  </motion.label>
                )
              })}
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

          <motion.div
            className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2"
            initial={reduce ? false : 'hidden'}
            animate="show"
            variants={reduce ? undefined : formFieldsParent}
          >
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
            <motion.div className="sm:col-span-2" variants={reduce ? undefined : formFieldItem}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
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
            </motion.div>
          </motion.div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

type Origin = { x: number; y: number }
/** how a modal arrives: `rise` lifts into the middle; `iris` opens out of the button that was pressed;
 *  `sheet` comes up from the foot of the screen; `curtain` opens from a line across the middle */
type ModalEnter = 'rise' | 'iris' | 'sheet' | 'curtain'

/** The form, kept out of the page until it is asked for, on a native modal dialog (focus stays inside, Esc closes,
 *  the page behind is inert, focus returns to the button that opened it). `drawer` slides in from the reading edge;
 *  `modal` arrives in the middle of the screen, in one of four ways (`enter`). The form stays mounted, so a
 *  half-written inquiry survives closing. */
function InquiryDrawer({
  lang,
  open,
  preset,
  onClose,
  mode = 'drawer',
  enter = 'rise',
  origin = null,
}: {
  lang: Lang
  open: boolean
  preset: { id: InquiryId | null; n: number }
  onClose: () => void
  mode?: 'drawer' | 'modal'
  enter?: ModalEnter
  /** `iris` only: the point on screen the modal opens from */
  origin?: Origin | null
}) {
  const f = CONTACT_FORM
  const reduce = !!useReducedMotion()
  const rtl = lang === 'ar'
  const ref = useRef<HTMLDialogElement | null>(null)
  const panel = useRef<HTMLDivElement | null>(null)
  const modal = mode === 'modal'
  const how: ModalEnter = modal && !reduce ? enter : 'rise'

  // the iris: a circle that opens from the pressed button until it has cleared the whole screen
  const irisR = useMotionValue(0)
  const irisX = useMotionValue(0)
  const irisY = useMotionValue(0)
  const iris = useMotionTemplate`circle(${irisR}px at ${irisX}px ${irisY}px)`
  useEffect(() => {
    if (how !== 'iris') return
    if (open) {
      irisX.set(origin?.x ?? window.innerWidth / 2)
      irisY.set(origin?.y ?? window.innerHeight / 2)
    }
    const c = animate(irisR, open ? Math.hypot(window.innerWidth, window.innerHeight) : 0, {
      duration: open ? 0.75 : 0.3,
      ease: open ? EASE_OUT : EASE_IN_OUT,
    })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, how])

  useEffect(() => {
    const d = ref.current
    if (!d || !open || d.open) return
    d.showModal()
    document.documentElement.style.overflow = 'hidden'
    panel.current?.scrollTo({ top: 0 })
    // land on the first thing to answer: the route if none is set yet, otherwise the name
    window.requestAnimationFrame(() => {
      const target = preset.id ? d.querySelector<HTMLElement>('#cf-name') : d.querySelector<HTMLElement>('input[name="topic"]')
      target?.focus({ preventScroll: true })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(
    () => () => {
      document.documentElement.style.overflow = ''
    },
    [],
  )

  // once the sheet has gone, the dialog closes and the page scrolls again
  const finish = () => {
    if (open || !ref.current?.open) return
    ref.current.close()
    document.documentElement.style.overflow = ''
  }

  const shut = 'inset(50% 0% 50% 0% round 24px)'
  const wide = 'inset(0% 0% 0% 0% round 24px)'
  const off = reduce
    ? { x: 0, y: 0, scale: 1, opacity: 0 }
    : !modal
      ? { x: rtl ? '-100%' : '100%', y: 0, scale: 1, opacity: 1 }
      : how === 'sheet'
        ? { x: 0, y: '104%', scale: 1, opacity: 1 }
        : how === 'curtain'
          ? { x: 0, y: 0, scale: 1, opacity: 0, clipPath: shut }
          : how === 'iris'
            ? { x: 0, y: 0, scale: 0.96, opacity: 0 }
            : { x: 0, y: 28, scale: 0.98, opacity: 0 }
  const on = how === 'curtain' ? { x: 0, y: 0, scale: 1, opacity: 1, clipPath: wide } : { x: 0, y: 0, scale: 1, opacity: 1 }
  return (
    <dialog
      ref={ref}
      className="iti-drawer"
      aria-labelledby={`cf-${mode}-title`}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      <motion.div
        className="iti-drawer-scrim"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: reduce ? 0.15 : 0.35 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className={
          !modal
            ? 'contents'
            : how === 'sheet'
              ? 'pointer-events-none absolute inset-0 grid place-items-end justify-items-center px-0 pt-6 sm:px-6'
              : 'pointer-events-none absolute inset-0 grid place-items-center p-3 sm:p-6'
        }
        style={how === 'iris' ? { clipPath: iris } : undefined}
      >
        <motion.div
          ref={panel}
          className={modal ? `iti-modal-panel pointer-events-auto ${how === 'sheet' ? 'is-sheet' : ''}` : 'iti-drawer-panel'}
          initial={false}
          animate={open ? on : off}
          transition={
            reduce
              ? { duration: 0.15 }
              : { type: 'tween', duration: open ? (!modal ? 0.55 : how === 'rise' ? 0.45 : 0.65) : 0.3, ease: open ? EASE_OUT : EASE_IN_OUT }
          }
          onAnimationComplete={finish}
        >
          <div className="iti-drawer-head">
            <div>
              <p className="iti-eyebrow">{f.launchEyebrow[lang]}</p>
              <h3 id={`cf-${mode}-title`} className="mt-3 font-[family-name:var(--iti-head)] text-[length:var(--iti-fs-h3)] leading-tight font-extrabold text-[var(--iti-navy)]">
                {f.drawerTitle[lang]}
              </h3>
            </div>
            <CloseButton label={COPY.nav.close[lang]} onClick={onClose} />
          </div>
          <div className="px-6 pt-6 pb-10 sm:px-10">
            <InquiryForm lang={lang} preset={preset} />
          </div>
        </motion.div>
      </motion.div>
    </dialog>
  )
}

function CloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="iti-drawer-close" aria-label={label}>
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
        <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
      </svg>
    </button>
  )
}

/** the form's open state and the route it should open on, shared by every version */
function useInquiry() {
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<{ id: InquiryId | null; n: number }>({ id: null, n: 0 })
  const openForm = (id: InquiryId | null) => {
    setPreset((p) => ({ id, n: p.n + 1 }))
    setOpen(true)
  }
  return { open, preset, openForm, close: () => setOpen(false) }
}

/** Version 1 — what stands in the section instead of the form: the four routes in; each opens the form set to it */
function InquiryLaunch({ lang, onOpen }: { lang: Lang; onOpen: (id: InquiryId | null) => void }) {
  const f = CONTACT_FORM
  const rtl = lang === 'ar'
  return (
    <div className="iti-launch relative overflow-hidden rounded-[26px] p-7 text-white sm:p-10">
      <p className="iti-eyebrow iti-eyebrow-light">{f.launchEyebrow[lang]}</p>
      <h3 className="mt-4 max-w-[22ch] font-[family-name:var(--iti-head)] text-[length:var(--iti-fs-h3)] leading-tight font-extrabold">{f.launchTitle[lang]}</h3>
      <ul className="mt-8">
        {INQUIRIES.map((q) => (
          <li key={q.id} className="border-t border-white/12 last:border-b">
            <button type="button" onClick={() => onOpen(q.id)} className="iti-route group" aria-haspopup="dialog">
              <LineIcon className="h-8 w-8 shrink-0 text-[var(--iti-champagne)]">{INQUIRY_ICONS[q.id]}</LineIcon>
              <span className="min-w-0 flex-1 text-start">
                <span className="block font-[family-name:var(--iti-head)] text-[1.02rem] leading-snug font-bold">{q.title[lang]}</span>
                <span className="mt-1 block text-[0.86rem] leading-snug text-white/60">{q.blurb[lang]}</span>
              </span>
              <span className="iti-route-arrow" aria-hidden>
                <Arrow rtl={rtl} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Magnetic strength={0.18}>
          <button type="button" onClick={() => onOpen(null)} className="iti-btn iti-btn-copper group shrink-0" aria-haspopup="dialog">
            {f.launchCta[lang]}
            <Arrow rtl={rtl} />
          </button>
        </Magnetic>
        <p className="max-w-[44ch] text-[0.78rem] leading-relaxed text-white/55">{f.launchNote[lang]}</p>
      </div>
    </div>
  )
}

/** Email, head office and website — stacked beside the copy, or in a row of three under it; on Mist or on navy */
function DirectLines({ lang, layout = 'stack', tone = 'light' }: { lang: Lang; layout?: 'stack' | 'row'; tone?: 'light' | 'dark' }) {
  const t = COPY.contact
  const time = useBarcelonaTime(lang)
  const [copied, setCopied] = useState(false)
  const dark = tone === 'dark'

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
          <button type="button" onClick={copyEmail} className={`iti-text-btn ${dark ? 'iti-text-btn-light' : ''}`} aria-live="polite">
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
          <span className={`mt-1.5 block text-[0.82rem] font-normal ${dark ? 'text-white/55' : 'text-[var(--iti-ink-soft)]'}`}>
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

  const row = layout === 'row'
  const ink = dark ? 'text-white' : 'text-[var(--iti-navy)]'
  const rule = dark ? 'border-white/12' : 'border-[var(--iti-line)]'
  return (
    <dl className={row ? `grid border-t ${rule} sm:grid-cols-3` : ''}>
      {direct.map((d, i) => (
        <div
          key={d.k}
          className={
            row
              ? `flex gap-5 py-7 sm:px-7 sm:first:ps-0 ${i > 0 ? `border-t ${rule} sm:border-t-0 sm:border-s` : ''}`
              : `flex gap-6 py-6 ${i > 0 ? `border-t ${rule}` : ''}`
          }
        >
          <LineIcon className={`mt-1 h-7 w-7 shrink-0 ${dark ? 'text-[var(--iti-champagne)]' : 'text-[var(--iti-copper)]'}`}>{d.icon}</LineIcon>
          <div className="min-w-0">
            <dt className={`text-[0.68rem] font-bold tracking-[0.2em] uppercase rtl:text-[0.78rem] rtl:tracking-normal ${dark ? 'text-white/60' : 'text-[var(--iti-navy)]'}`}>{d.k}</dt>
            <dd className={`mt-1.5 text-[1rem] leading-snug font-semibold ${ink}`}>{d.v}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

/** the same soft paper sheets as the values section, so the page closes in its own material */
function ContactSheets() {
  return (
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
  )
}

function ContactIntro({ lang, center = false, dark = false }: { lang: Lang; center?: boolean; dark?: boolean }) {
  const t = COPY.contact
  return (
    <>
      <Reveal>
        <p className={`iti-eyebrow ${dark ? 'iti-eyebrow-light' : ''} ${center ? 'justify-center' : ''}`}>{t.eyebrow[lang]}</p>
      </Reveal>
      <SplitReveal text={t.title[lang]} emphasis={emph(lang, 1, 1)} className={`iti-h2 iti-contact-title mt-6 ${center ? 'text-center' : ''}`} />
      <Reveal delay={0.1}>
        <p className={`mt-7 max-w-[44ch] text-[1.05rem] leading-[1.75] ${dark ? 'text-white/70' : 'text-[var(--iti-ink-soft)]'} ${center ? 'mx-auto text-center' : ''}`}>{t.body[lang]}</p>
      </Reveal>
    </>
  )
}

/* ---------- Version 1 — copy and direct lines; the four routes on a navy card; the form in a drawer ---------- */
function ContactRoutes({ lang }: { lang: Lang }) {
  const q = useInquiry()
  return (
    <section id="contact" className="iti-contact relative isolate overflow-hidden py-24 sm:py-32">
      <ContactSheets />
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 xl:col-span-4">
          <ContactIntro lang={lang} />
          <Reveal delay={0.15}>
            <div className="mt-10">
              <DirectLines lang={lang} />
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="lg:col-span-7 xl:col-span-8 xl:ps-10">
          <InquiryLaunch lang={lang} onOpen={q.openForm} />
        </Reveal>
      </div>
      <InquiryDrawer lang={lang} open={q.open} preset={q.preset} onClose={q.close} />
    </section>
  )
}

/* ---------- Version 2 — one centred statement, one button; topics as small shortcuts; the form in a drawer ---------- */
function ContactStatement({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const rtl = lang === 'ar'
  const q = useInquiry()
  return (
    <section id="contact" className="iti-contact relative isolate overflow-hidden py-24 sm:py-32">
      <ContactSheets />
      <div className="mx-auto max-w-[1100px] px-5 text-center sm:px-8">
        <ContactIntro lang={lang} center />
        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <button type="button" onClick={() => q.openForm(null)} className="iti-btn iti-btn-navy group" aria-haspopup="dialog">
                {f.launchCta[lang]}
                <Arrow rtl={rtl} />
              </button>
            </Magnetic>
            <a href={`mailto:${CONTACT.email}`} className="iti-btn iti-btn-outline">
              {f.emailDirect[lang]}
            </a>
          </div>
          <p className="mx-auto mt-5 max-w-[52ch] text-[0.8rem] leading-relaxed text-[var(--iti-ink-soft)]">{f.launchNote[lang]}</p>
          <div className="mt-10">
            <p className="text-[0.7rem] font-bold tracking-[0.2em] text-[var(--iti-navy)] uppercase rtl:text-[0.8rem] rtl:tracking-normal">{f.routesLead[lang]}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2.5">
              {INQUIRIES.map((it) => (
                <button key={it.id} type="button" onClick={() => q.openForm(it.id)} className="iti-topic" aria-haspopup="dialog">
                  <LineIcon className="h-5 w-5 shrink-0 text-[var(--iti-copper)]">{INQUIRY_ICONS[it.id]}</LineIcon>
                  {it.title[lang]}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={0.2} className="mx-auto mt-20 max-w-[1400px] px-5 text-start sm:px-8">
        <DirectLines lang={lang} layout="row" />
      </Reveal>
      <InquiryDrawer lang={lang} open={q.open} preset={q.preset} onClose={q.close} />
    </section>
  )
}

/* ---------- Version 3 — the form folds out in place, inside the card, when asked for ---------- */
function ContactInline({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const rtl = lang === 'ar'
  const reduce = !!useReducedMotion()
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<{ id: InquiryId | null; n: number }>({ id: null, n: 0 })
  const card = useRef<HTMLDivElement | null>(null)
  const opener = useRef<HTMLButtonElement | null>(null)

  const unfold = (id: InquiryId | null) => {
    setPreset((p) => ({ id, n: p.n + 1 }))
    setOpen(true)
  }
  // once the form has folded out: bring the card up and land on the first thing to answer
  const landed = () => {
    if (!open) return
    card.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    const target = preset.id ? card.current?.querySelector<HTMLElement>('#cf-name') : card.current?.querySelector<HTMLElement>('input[name="topic"]')
    target?.focus({ preventScroll: true })
  }
  const fold = () => {
    setOpen(false)
    window.setTimeout(() => opener.current?.focus(), 50)
  }

  return (
    <section id="contact" className="iti-contact relative isolate overflow-hidden py-24 sm:py-32">
      <ContactSheets />
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 xl:col-span-4">
          <ContactIntro lang={lang} />
          <Reveal delay={0.15}>
            <div className="mt-10">
              <DirectLines lang={lang} />
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="lg:col-span-7 xl:col-span-8 xl:ps-10">
          <div ref={card} className="iti-form-card scroll-mt-28">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="iti-eyebrow">{f.launchEyebrow[lang]}</p>
                <h3 className="mt-4 max-w-[24ch] font-[family-name:var(--iti-head)] text-[length:var(--iti-fs-h3)] leading-tight font-extrabold text-[var(--iti-navy)]">
                  {open ? f.drawerTitle[lang] : f.launchTitle[lang]}
                </h3>
              </div>
              {open && <CloseButton label={f.closeForm[lang]} onClick={fold} />}
            </div>

            <AnimatePresence initial={false} mode="wait">
              {open ? (
                <motion.div
                  key="form"
                  id="cf-inline"
                  className="overflow-hidden"
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0.15 : 0.5, ease: EASE_OUT }}
                  onAnimationComplete={landed}
                >
                  <div className="mt-8 border-t border-[var(--iti-line)] pt-8">
                    <InquiryForm lang={lang} preset={preset} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="closed"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {INQUIRIES.map((it) => (
                      <button key={it.id} type="button" onClick={() => unfold(it.id)} className="iti-route-tile group" aria-expanded={false} aria-controls="cf-inline">
                        <LineIcon className="h-7 w-7 shrink-0 text-[var(--iti-copper)]">{INQUIRY_ICONS[it.id]}</LineIcon>
                        <span className="min-w-0 flex-1 text-start">
                          <span className="block font-[family-name:var(--iti-head)] text-[0.98rem] leading-snug font-bold text-[var(--iti-navy)]">{it.title[lang]}</span>
                          <span className="mt-1 block text-[0.82rem] leading-snug text-[var(--iti-ink-soft)]">{it.blurb[lang]}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <button
                      ref={opener}
                      type="button"
                      onClick={() => unfold(null)}
                      className="iti-btn iti-btn-navy group shrink-0 self-start"
                      aria-expanded={false}
                      aria-controls="cf-inline"
                    >
                      {f.launchCta[lang]}
                      <Arrow rtl={rtl} />
                    </button>
                    <p className="max-w-[44ch] text-[0.78rem] leading-relaxed text-[var(--iti-ink-soft)]">{f.launchNote[lang]}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Version 4 — a navy band that carries on from the map; routes as tiles; the form in a centred modal ---------- */
function ContactNight({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const rtl = lang === 'ar'
  const q = useInquiry()
  return (
    <section id="contact" className="iti-contact-night relative isolate overflow-hidden py-24 text-white sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <ContactIntro lang={lang} dark />
            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Magnetic>
                  <button type="button" onClick={() => q.openForm(null)} className="iti-btn iti-btn-copper group" aria-haspopup="dialog">
                    {f.launchCta[lang]}
                    <Arrow rtl={rtl} />
                  </button>
                </Magnetic>
                <a href={`mailto:${CONTACT.email}`} className="iti-btn iti-btn-ghost">
                  {f.emailDirect[lang]}
                </a>
              </div>
              <p className="mt-5 max-w-[44ch] text-[0.78rem] leading-relaxed text-white/55">{f.launchNote[lang]}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-7 xl:ps-10">
            <p className="iti-eyebrow iti-eyebrow-light">{f.launchTitle[lang]}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {INQUIRIES.map((it) => (
                <button key={it.id} type="button" onClick={() => q.openForm(it.id)} className="iti-night-tile group" aria-haspopup="dialog">
                  <span className="flex items-start justify-between gap-4">
                    <LineIcon className="h-9 w-9 shrink-0 text-[var(--iti-champagne)]">{INQUIRY_ICONS[it.id]}</LineIcon>
                    <span className="iti-route-arrow" aria-hidden>
                      <Arrow rtl={rtl} />
                    </span>
                  </span>
                  <span className="mt-8 block text-start font-[family-name:var(--iti-head)] text-[1.08rem] leading-snug font-bold">{it.title[lang]}</span>
                  <span className="mt-1.5 block text-start text-[0.86rem] leading-snug text-white/60">{it.blurb[lang]}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="mt-20">
          <DirectLines lang={lang} layout="row" tone="dark" />
        </Reveal>
      </div>
      <InquiryDrawer lang={lang} open={q.open} preset={q.preset} onClose={q.close} mode="modal" />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Contact, second round — versions 5 to 8. The client's brief: the    */
/* form is not the subject of the section. One clear call to action;   */
/* the form opens in a modal only when it is asked for. Four layouts,  */
/* four buttons, four ways for the modal to arrive.                    */
/* ------------------------------------------------------------------ */

/** the middle of whatever was pressed, in viewport pixels — where the iris opens from */
const centreOf = (el: Element): Origin => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/** the quiet alternative under the button: write to us directly */
function MailLine({ lang, dark = false, className = '' }: { lang: Lang; dark?: boolean; className?: string }) {
  return (
    <p className={`iti-cta-mail ${dark ? 'is-dark' : ''} ${className}`}>
      <span>{CONTACT_FORM.emailDirect[lang]}</span>
      <a href={`mailto:${CONTACT.email}`} className="iti-link-underline" dir="ltr">
        {CONTACT.email}
      </a>
    </p>
  )
}

/* ---------- Version 5 — Invitation: open Mist, the statement, one pill. The modal rises into the middle ---------- */
function ContactInvitation({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const rtl = lang === 'ar'
  const q = useInquiry()
  return (
    <section id="contact" className="iti-contact relative isolate overflow-hidden py-28 sm:py-40">
      <ContactSheets />
      <div className="mx-auto max-w-[900px] px-5 text-center sm:px-8">
        <ContactIntro lang={lang} center />
        <Reveal delay={0.18}>
          <div className="mt-12 flex justify-center">
            <span className="iti-cta-halo">
              <Magnetic strength={0.2}>
                <button type="button" onClick={() => q.openForm(null)} className="iti-cta-pill" aria-haspopup="dialog">
                  <span>{f.launchCta[lang]}</span>
                  <span className="iti-cta-pill-dot" aria-hidden>
                    <Arrow rtl={rtl} />
                  </span>
                </button>
              </Magnetic>
            </span>
          </div>
          <MailLine lang={lang} className="mt-10 justify-center" />
        </Reveal>
      </div>
      <InquiryDrawer lang={lang} open={q.open} preset={q.preset} onClose={q.close} mode="modal" />
    </section>
  )
}

/* ---------- Version 6 — Orbit: the night carried on from the map; a round button with a light circling it. The modal opens out of the button ---------- */
function ContactOrbit({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const rtl = lang === 'ar'
  const q = useInquiry()
  const [origin, setOrigin] = useState<Origin | null>(null)
  return (
    <section id="contact" className="iti-contact-night relative isolate overflow-hidden py-28 text-white sm:py-40">
      <div className="mx-auto grid max-w-[1400px] items-center gap-x-12 gap-y-24 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactIntro lang={lang} dark />
          <Reveal delay={0.2}>
            <MailLine lang={lang} dark className="mt-10" />
          </Reveal>
        </div>
        <Reveal delay={0.15} className="flex justify-center pb-10 lg:col-span-5 lg:justify-end lg:pe-20 lg:pb-0">
          <Magnetic strength={0.16}>
            <button
              type="button"
              className="iti-cta-orb"
              aria-haspopup="dialog"
              onClick={(e) => {
                setOrigin(centreOf(e.currentTarget))
                q.openForm(null)
              }}
            >
              <span className="iti-cta-orbit" aria-hidden />
              <span className="iti-cta-orbit iti-cta-orbit-far" aria-hidden />
              <span className="max-w-[9ch]">{f.launchCta[lang]}</span>
              <span className="iti-cta-orb-arrow" aria-hidden>
                <Arrow rtl={rtl} />
              </span>
            </button>
          </Magnetic>
        </Reveal>
      </div>
      <InquiryDrawer lang={lang} open={q.open} preset={q.preset} onClose={q.close} mode="modal" enter="iris" origin={origin} />
    </section>
  )
}

/* ---------- Version 7 — Headline: white paper; the sentence is the button. The modal rises as a sheet from the foot of the screen ---------- */
function ContactHeadline({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const t = COPY.contact
  const rtl = lang === 'ar'
  const q = useInquiry()
  return (
    <section id="contact" className="iti-cta-line relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <Reveal>
            <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[46ch] text-[1rem] leading-[1.7] text-[var(--iti-ink-soft)]">{t.body[lang]}</p>
          </Reveal>
        </div>
        <Reveal delay={0.12}>
          <button type="button" className="iti-cta-headline mt-8 sm:mt-10" onClick={() => q.openForm(null)} aria-haspopup="dialog">
            <span className="iti-cta-headline-text">
              {t.title[lang].split('\n').map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
            <span className="iti-cta-go">
              <span>{f.launchCta[lang]}</span>
              <span className="iti-cta-go-chip" aria-hidden>
                <Arrow rtl={rtl} />
              </span>
            </span>
          </button>
        </Reveal>
        <Reveal delay={0.2}>
          <DirectLines lang={lang} layout="row" />
        </Reveal>
      </div>
      <InquiryDrawer lang={lang} open={q.open} preset={q.preset} onClose={q.close} mode="modal" enter="sheet" />
    </section>
  )
}

/* ---------- Version 8 — Plate: the Group's navy plate on Mist, and one copper tile to press. The modal opens like a curtain ---------- */
function ContactPlate({ lang }: { lang: Lang }) {
  const f = CONTACT_FORM
  const rtl = lang === 'ar'
  const q = useInquiry()
  return (
    <section id="contact" className="iti-contact relative isolate overflow-hidden py-24 sm:py-32">
      <ContactSheets />
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal>
          <div className="iti-cta-plate iti-on-night">
            <div>
              <ContactIntro lang={lang} dark />
              <MailLine lang={lang} dark className="mt-10" />
            </div>
            <button type="button" className="iti-cta-tile" onClick={() => q.openForm(null)} aria-haspopup="dialog">
              <span className="flex items-start justify-between gap-4">
                <span className="iti-cta-tile-kicker">{f.launchEyebrow[lang]}</span>
                <span className="iti-cta-tile-arrow" aria-hidden>
                  <Arrow rtl={rtl} />
                </span>
              </span>
              <span className="iti-cta-tile-label">{f.launchCta[lang]}</span>
            </button>
          </div>
        </Reveal>
      </div>
      <InquiryDrawer lang={lang} open={q.open} preset={q.preset} onClose={q.close} mode="modal" enter="curtain" />
    </section>
  )
}

/** Contact — the version comes from the address (?contact=1…8); 1 is the current design.
 *  5–8 follow the client's brief: one call to action, the form in a modal */
export function ItiContact({ lang }: { lang: Lang }) {
  const v = useVariant('contact')
  if (v === 2) return <ContactStatement lang={lang} />
  if (v === 3) return <ContactInline lang={lang} />
  if (v === 4) return <ContactNight lang={lang} />
  if (v === 5) return <ContactInvitation lang={lang} />
  if (v === 6) return <ContactOrbit lang={lang} />
  if (v === 7) return <ContactHeadline lang={lang} />
  if (v === 8) return <ContactPlate lang={lang} />
  return <ContactRoutes lang={lang} />
}

export function ItiFooter({ lang }: { lang: Lang }) {
  const t = COPY.footer
  const nav = COPY.nav
  return (
    <footer className="relative bg-[var(--iti-surface-dark)] text-white">
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
