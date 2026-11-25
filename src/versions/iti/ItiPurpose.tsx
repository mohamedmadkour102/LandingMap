import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionStyle, type MotionValue } from 'framer-motion'
import { COPY, type Lang } from './content'
import { ICON_FRAME, ICON_SHAPES } from './ItiLogo'
import { useVariant } from './variants'
import embedAspect from './embedAspect.json'
import { Reveal } from '../../components/Reveal'
import { Picture } from './media'
import { EASE_IN_OUT, EASE_OUT, SplitReveal, spotlight } from './fx'

/* ------------------------------------------------------------------ */
/* Vision & Mission — "from the ground to the horizon".               */
/* The section holds still while the page scrolls past it: the view   */
/* rises from the plant floor (Mission — what we do today) to the     */
/* horizon (Vision — where we are going). Each statement fills in     */
/* word by word at the reader's own pace. No buttons, no timer.       */
/* The scene is drawn, not photographed: abstract industrial forms    */
/* in the guideline navy, steel and copper.                           */
/* ------------------------------------------------------------------ */

type Range = number[]

/** where each beat happens along the section's scroll (0 → 1) */
const BEATS = {
  mission: { fill: [0.02, 0.3], body: [0.27, 0.35], out: [0.43, 0.5] },
  vision: { in: [0.47, 0.55], fill: [0.55, 0.8], body: [0.77, 0.85] },
  camera: [0.06, 0.9],
}

function Word({ word, p, from, to, className }: { word: string; p: MotionValue<number>; from: number; to: number; className?: string }) {
  const opacity = useTransform(p, [from, to], [0.16, 1])
  return (
    <motion.span className={className} style={{ opacity }}>
      {word}
    </motion.span>
  )
}

/** which words of `text` belong to the `accent` phrase */
function accentMask(text: string, accent?: string) {
  const start = accent ? text.indexOf(accent) : -1
  const end = start + (accent?.length ?? 0)
  let pos = 0
  return text.split(' ').map((w) => {
    const a = pos
    pos += w.length + 1
    return start >= 0 && a < end && a + w.length > start
  })
}

/** the statement lights up word by word as the reader scrolls through `range`; an accent phrase reads in copper */
function Statement({
  text,
  p,
  range,
  still,
  accent,
  className = 'iti-purpose-statement',
}: {
  text: string
  p: MotionValue<number>
  range: Range
  still: boolean
  accent?: string
  className?: string
}) {
  const words = text.split(' ')
  const hot = accentMask(text, accent)
  const n = words.length
  const step = (range[1] - range[0]) / n
  return (
    <p className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {still ? (
            <span className={hot[i] ? 'iti-purpose-accent' : undefined}>{w}</span>
          ) : (
            <Word word={w} p={p} from={range[0] + i * step} to={range[0] + (i + 1.8) * step} className={hot[i] ? 'iti-purpose-accent' : undefined} />
          )}
          {i < n - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </p>
  )
}

function Block({
  lang,
  which,
  p,
  still,
  style,
  fill,
  body,
  layout = 'center',
}: {
  lang: Lang
  which: 'mission' | 'vision'
  p: MotionValue<number>
  still: boolean
  style?: Record<string, MotionValue<number> | number>
  fill: Range
  body: Range
  /** center: the horizon and the arrow; manifesto: large type set from the reading edge */
  layout?: 'center' | 'manifesto'
}) {
  const s = COPY[which]
  const bodyOpacity = useTransform(p, body, [0, 1])
  const bodyY = useTransform(p, body, [14, 0])
  const manifesto = layout === 'manifesto'
  return (
    <motion.div className={still ? 'relative' : 'absolute inset-x-0 top-0'} style={still ? undefined : style}>
      <div className={manifesto ? 'mx-auto max-w-[1400px] px-5 sm:px-8 lg:ps-24' : 'mx-auto max-w-[1100px] px-6 text-center sm:px-10'}>
        <h2 className={`iti-eyebrow iti-eyebrow-light iti-purpose-eyebrow ${manifesto ? '' : 'justify-center'}`}>
          <span dir="ltr">{which === 'mission' ? '01' : '02'}</span>
          <span aria-hidden className="h-px w-6 bg-white/30" />
          {s.eyebrow[lang]}
        </h2>
        <div className={manifesto ? 'mt-8' : 'mt-7'}>
          <Statement
            text={s.headline[lang]}
            p={p}
            range={fill}
            still={still}
            accent={manifesto ? s.accent[lang] : undefined}
            className={manifesto ? 'iti-manifesto-statement' : 'iti-purpose-statement'}
          />
        </div>
        <motion.p
          className={`${manifesto ? 'iti-manifesto-body mt-8 max-w-[40ch]' : 'mx-auto mt-7 max-w-[52ch]'} text-[length:var(--iti-fs-lead)] leading-[1.7] text-white/70`}
          style={still ? undefined : { opacity: bodyOpacity, y: bodyY }}
        >
          {s.body[lang]}
        </motion.p>
      </div>
    </motion.div>
  )
}

/** Abstract industrial scene. `cam` 0 = at ground level among the structures, 1 = the horizon in view,
 *  low enough that the statement stands in open sky */
function Scene({ cam, rtl, frame = 'xMidYMid' }: { cam: MotionValue<number>; rtl: boolean; frame?: string }) {
  const horizonY = useTransform(cam, [0, 1], [-560, 110])
  const midY = useTransform(cam, [0, 1], [0, 540])
  const nearY = useTransform(cam, [0, 1], [0, 780])
  const sunY = useTransform(cam, [0.35, 1], [90, 0])
  const sunGlow = useTransform(cam, [0.3, 1], [0.35, 1])

  const silos = [
    { x: 1010, w: 150, top: 170 },
    { x: 1172, w: 172, top: 120 },
    { x: 1356, w: 150, top: 196 },
    { x: 1518, w: 140, top: 240 },
  ]
  const fan = Array.from({ length: 25 }, (_, i) => -1600 + i * 200)
  const rows = [10, 26, 50, 86, 140, 220, 340, 520]
  const skyline: [number, number, number, number][] = [
    [110, 574, 70, 26],
    [188, 556, 26, 44],
    [226, 582, 96, 18],
    [336, 540, 12, 60],
    [360, 586, 60, 14],
    [1150, 572, 84, 28],
    [1240, 552, 30, 48],
    [1282, 580, 130, 20],
    [1428, 534, 12, 66],
    [1452, 584, 70, 16],
  ]

  return (
    <svg
      className={`absolute inset-0 h-full w-full ${rtl ? '-scale-x-100' : ''}`}
      viewBox="0 0 1600 1000"
      preserveAspectRatio={`${frame} slice`}
      aria-hidden
    >
      <defs>
        <linearGradient id="ps-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#01131f" />
          <stop offset="0.55" stopColor="#053552" />
          <stop offset="0.86" stopColor="#1d5677" />
          <stop offset="1" stopColor="#4a7f99" />
        </linearGradient>
        <radialGradient id="ps-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f0c9a2" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#e39a6b" stopOpacity="0.2" />
          <stop offset="1" stopColor="#e39a6b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ps-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d3d5a" />
          <stop offset="0.1" stopColor="#062b44" />
          <stop offset="0.4" stopColor="#031f33" />
        </linearGradient>
        <linearGradient id="ps-hline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e39a6b" stopOpacity="0" />
          <stop offset="0.5" stopColor="#f0c9a2" stopOpacity="0.95" />
          <stop offset="1" stopColor="#e39a6b" stopOpacity="0" />
        </linearGradient>
        {/* cylindrical shading: the light comes from the upper left */}
        <linearGradient id="ps-silo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#072c44" />
          <stop offset="0.36" stopColor="#1c5577" />
          <stop offset="0.52" stopColor="#245f81" />
          <stop offset="1" stopColor="#041f33" />
        </linearGradient>
        <linearGradient id="ps-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0f4565" />
          <stop offset="1" stopColor="#062a41" />
        </linearGradient>
        <pattern id="ps-rings" width="40" height="34" patternUnits="userSpaceOnUse">
          <path d="M0 0.5H40" stroke="#fff" strokeOpacity="0.08" />
        </pattern>
        <pattern id="ps-brace" width="70" height="96" patternUnits="userSpaceOnUse">
          <path d="M0 0L70 96M70 0L0 96M0 0.5H70" stroke="#fff" strokeOpacity="0.075" fill="none" />
        </pattern>
        <clipPath id="ps-above">
          <rect x="-200" y="-2000" width="2000" height="2600" />
        </clipPath>
      </defs>

      <rect x="-200" y="-200" width="2000" height="1400" fill="#01131f" />

      {/* sky, horizon and ground: far away, they arrive as the view rises */}
      <motion.g style={{ y: horizonY }}>
        <rect x="-200" y="-1400" width="2000" height="2000" fill="url(#ps-sky)" />
        <g clipPath="url(#ps-above)" fill="none" stroke="#fff" strokeOpacity="0.05">
          {[150, 250, 370, 510, 670, 850].map((r) => (
            <ellipse key={r} cx="800" cy="600" rx={r * 1.7} ry={r} />
          ))}
        </g>
        <motion.ellipse cx="800" cy="600" rx="780" ry="340" fill="url(#ps-glow)" style={{ opacity: sunGlow }} />
        <g clipPath="url(#ps-above)">
          <motion.circle cx="800" cy="600" r="50" fill="#f3d3b2" fillOpacity="0.9" style={{ y: sunY }} />
        </g>
        <rect x="-200" y="600" width="2000" height="1400" fill="url(#ps-ground)" />
        {/* the plain, set out like a drawing: lines to one vanishing point */}
        <g stroke="#fff" strokeOpacity="0.05">
          {fan.map((x) => (
            <line key={x} x1="800" y1="600" x2={x} y2="1700" />
          ))}
          {rows.map((d) => (
            <line key={d} x1="-200" y1={600 + d} x2="1800" y2={600 + d} />
          ))}
        </g>
        <g fill="#0a3956">
          {skyline.map(([x, y, w, h]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />
          ))}
        </g>
        <line x1="-200" y1="600" x2="1800" y2="600" stroke="url(#ps-hline)" strokeWidth="1.6" />
      </motion.g>

      {/* middle distance: a tower crane and a kiln, faint */}
      <motion.g style={{ y: midY }} opacity="0.45">
        <g stroke="#fff" strokeOpacity="0.16" fill="none">
          <rect x="748" y="232" width="24" height="1300" fill="url(#ps-brace)" />
          <rect x="590" y="214" width="560" height="18" fill="url(#ps-brace)" />
          <path d="M760 214L760 150L640 214M760 150L1150 214" />
          <line x1="1010" y1="232" x2="1010" y2="470" />
          <rect x="998" y="470" width="24" height="16" />
          <rect x="604" y="232" width="56" height="34" fill="#0a3956" />
        </g>
        <g transform="rotate(-5 640 760)">
          <rect x="380" y="740" width="540" height="48" rx="24" fill="url(#ps-silo)" stroke="#fff" strokeOpacity="0.14" />
          {[460, 640, 820].map((x) => (
            <path key={x} d={`M${x} 788l-22 70h44Z`} fill="#0a3956" stroke="#fff" strokeOpacity="0.1" />
          ))}
        </g>
      </motion.g>

      {/* up close: silos on one side, a preheater tower on the other, a conveyor between them */}
      <motion.g style={{ y: nearY }}>
        <g>
          <rect x="120" y="300" width="214" height="1300" fill="url(#ps-tower)" />
          <rect x="120" y="300" width="214" height="1300" fill="url(#ps-brace)" stroke="#fff" strokeOpacity="0.14" />
          <rect x="168" y="214" width="118" height="86" fill="url(#ps-tower)" stroke="#fff" strokeOpacity="0.14" />
          <rect x="217" y="36" width="20" height="178" fill="#0d4364" stroke="#fff" strokeOpacity="0.12" />
          <path d="M334 430h40v120l-20 26-20-26Z" fill="#0b3b58" stroke="#fff" strokeOpacity="0.12" />
        </g>
        <g stroke="#fff" fill="none">
          <path d="M334 452L1010 238" strokeOpacity="0.16" />
          <path d="M334 470L1010 256" strokeOpacity="0.16" />
          <path d="M334 461L1010 247" strokeOpacity="0.22" strokeDasharray="2 24" />
        </g>
        {silos.map((s) => (
          <g key={s.x}>
            <rect x={s.x} y={s.top} width={s.w} height={1500 - s.top} fill="url(#ps-silo)" />
            <rect x={s.x} y={s.top} width={s.w} height={1500 - s.top} fill="url(#ps-rings)" stroke="#fff" strokeOpacity="0.12" />
            <ellipse cx={s.x + s.w / 2} cy={s.top} rx={s.w / 2} ry="13" fill="#2a6788" stroke="#fff" strokeOpacity="0.22" />
          </g>
        ))}
        <path
          d={`M1010 ${silos[0].top - 34}H1658`}
          stroke="#fff"
          strokeOpacity="0.2"
          fill="none"
        />
        <path d="M1010 136v-34M1172 120v-34" stroke="#fff" strokeOpacity="0.16" />
      </motion.g>
    </svg>
  )
}

/** Version 1 — from the ground to the horizon */
function PurposeHorizon({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const rtl = lang === 'ar'
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // a function transform keeps the beats in JS: framer would otherwise hand opacity to a native ScrollTimeline,
  // which ignores this section's offsets and leaves the statements at the wrong opacity
  const p = useTransform(scrollYProgress, (v) => v)
  const camRaw = useTransform(p, BEATS.camera, [0, 1])
  const camSpring = useSpring(camRaw, { stiffness: 90, damping: 26, mass: 0.6 })
  const cam = reduce ? camRaw : camSpring

  const mOpacity = useTransform(p, BEATS.mission.out, [1, 0])
  const mY = useTransform(p, BEATS.mission.out, [0, -48])
  const vOpacity = useTransform(p, BEATS.vision.in, [0, 1])
  const vY = useTransform(p, BEATS.vision.in, [48, 0])
  const seam = useTransform(p, [0, 0.08], [1, 0])
  const marker = useTransform(cam, [0, 1], ['74%', '22%'])
  const horizon = useMotionValue(1)

  // reduced motion: no pinning, no word fill — both statements in full over the scene at the horizon
  if (reduce) {
    return (
      <section id="vision" className="iti-purpose-story relative isolate overflow-hidden py-28 text-white">
        <div className="absolute inset-0 -z-10">
          <Scene cam={horizon} rtl={rtl} />
          <div className="iti-purpose-veil absolute inset-0" />
        </div>
        <div className="flex flex-col gap-20">
          <Block lang={lang} which="mission" p={p} still fill={BEATS.mission.fill} body={BEATS.mission.body} />
          <Block lang={lang} which="vision" p={p} still fill={BEATS.vision.fill} body={BEATS.vision.body} />
        </div>
      </section>
    )
  }

  return (
    <section id="vision" ref={ref} className="iti-purpose-story relative h-[260svh] text-white lg:h-[300svh]" aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}>
      <div className="sticky top-0 isolate h-[100svh] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Scene cam={cam} rtl={rtl} />
          <div className="iti-purpose-veil absolute inset-0" />
          <div className="iti-purpose-grid absolute inset-0" />
          {/* About's steel seam at the very start, gone once the view begins to rise */}
          <motion.div className="iti-purpose-seam absolute inset-x-0 top-0 h-28" style={{ opacity: seam }} />
          <div className="iti-purpose-foot absolute inset-x-0 bottom-0 h-40" />
        </div>

        {/* elevation gauge — Mission at ground level, Vision at the horizon. It only reports; the scroll moves it.
            Below the Mission mark it carries on as the thread into the principles. */}
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1400px] px-5 sm:px-8" aria-hidden>
          <div className="relative h-full">
            <span className="iti-purpose-gauge absolute start-[7px] top-[22%] bottom-[26%] hidden w-px lg:block" />
            <span className="iti-purpose-thread absolute start-[7px] top-[74%] bottom-0 hidden w-px lg:block" />
            <span className="iti-purpose-thread absolute start-[7px] top-[88%] bottom-0 w-px lg:hidden" />
            <div className="hidden lg:block">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="absolute start-[3px] h-px w-[9px] bg-white/25" style={{ top: `${22 + (i * 52) / 13}%` }} />
              ))}
              <span className="iti-purpose-label absolute start-6 top-[22%] -translate-y-1/2">
                <span dir="ltr">02</span> {COPY.vision.short[lang]}
              </span>
              <span className="iti-purpose-label absolute start-6 top-[74%] -translate-y-1/2">
                <span dir="ltr">01</span> {COPY.mission.short[lang]}
              </span>
              <motion.span className="iti-purpose-marker absolute start-[2px]" style={{ top: marker }} />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="relative w-full">
            <Block lang={lang} which="mission" p={p} still={false} style={{ opacity: mOpacity, y: mY }} fill={BEATS.mission.fill} body={BEATS.mission.body} />
            {/* the mission block sets the height; the vision block sits over it */}
            <div className="invisible" aria-hidden>
              <Block lang={lang} which="mission" p={p} still fill={BEATS.mission.fill} body={BEATS.mission.body} />
            </div>
            <Block lang={lang} which="vision" p={p} still={false} style={{ opacity: vOpacity, y: vY }} fill={BEATS.vision.fill} body={BEATS.vision.body} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Version 2 (and the pinned helpers it shares with version 1): the scroll is the only control,  */
/* the statements fill word by word, the section ends on the night the */
/* principles open on, and a copper thread runs on down into them.     */
/* ------------------------------------------------------------------ */

/** scroll progress through a pinned section, kept in JS (see the note in PurposeHorizon) */
function usePinned() {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useTransform(scrollYProgress, (v) => v)
  return { ref, p }
}

/** the copper thread that carries on into the principles, on the same line as their eyebrow */
function Thread({ from = '86%' }: { from?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1400px] px-5 sm:px-8" aria-hidden>
      <div className="relative h-full">
        <span className="iti-purpose-thread absolute start-[7px] bottom-0 w-px" style={{ top: from }} />
      </div>
    </div>
  )
}

/** mission and vision in one place: mission sets the height, vision lies over it */
function Pair({
  lang,
  p,
  beats,
  layout,
}: {
  lang: Lang
  p: MotionValue<number>
  beats: { mission: { fill: Range; body: Range; out: Range }; vision: { in: Range; fill: Range; body: Range } }
  layout: 'center' | 'manifesto'
}) {
  const mOpacity = useTransform(p, beats.mission.out, [1, 0])
  const mY = useTransform(p, beats.mission.out, [0, -40])
  const vOpacity = useTransform(p, beats.vision.in, [0, 1])
  const vY = useTransform(p, beats.vision.in, [40, 0])
  return (
    <div className="relative w-full">
      <Block lang={lang} which="mission" p={p} still={false} style={{ opacity: mOpacity, y: mY }} fill={beats.mission.fill} body={beats.mission.body} layout={layout} />
      <div className="invisible" aria-hidden>
        <Block lang={lang} which="mission" p={p} still fill={beats.mission.fill} body={beats.mission.body} layout={layout} />
      </div>
      <Block lang={lang} which="vision" p={p} still={false} style={{ opacity: vOpacity, y: vY }} fill={beats.vision.fill} body={beats.vision.body} layout={layout} />
    </div>
  )
}

/** reduced motion: both statements in full, one under the other */
function StillPair({ lang, p, layout }: { lang: Lang; p: MotionValue<number>; layout: 'center' | 'manifesto' }) {
  return (
    <div className="flex flex-col gap-20">
      <Block lang={lang} which="mission" p={p} still fill={[0, 1]} body={[0, 1]} layout={layout} />
      <Block lang={lang} which="vision" p={p} still fill={[0, 1]} body={[0, 1]} layout={layout} />
    </div>
  )
}

/* ---------- Version 2 — Manifesto: the statement on the night, and the plant it speaks of standing in the same night ---------- */
/* The plants are not photographs placed on the page: they are cut out of their skies, in their own colours            */
/* (scripts/build-embeds.mjs), so they have no frame and no edge — daylight beside the Mission, lamplight beside the   */
/* Vision. They take the far side of the stage, where an enormous hollow numeral used to stand.                        */

/**
 * One plant on the stage. Every photograph is framed differently, so each brings its own placement:
 *   h — its height, as a share of the stage (the box takes the picture's own shape);  w — the most width it may take;
 *   x — how far it sits from the far edge (negative runs off it);
 *   fade  — where its near edge starts and finishes dissolving towards the text. A plant whose own silhouette ends
 *           inside the picture needs none ('0% 0%'); one that the picture cuts through needs a long one.
 *   edge  — the picture cuts the plant at its far side, so on phones too it must sit against the screen's edge.
 */
type Plate = { k: string; w?: string; h?: string; x?: string; fade?: string; edge?: boolean }

/**
 * The pairs on offer (?plates=1…6): [beside the Mission, beside the Vision].
 * On Mist Grey both are daylight: a whole plant at work for the Mission, a plant seen from below, looking up, for the Vision
 * (a night photograph cannot be cut out of a black sky onto a light page). On the night ground it is day, then lamplight.
 */
const MANIFESTO_SETS: Record<'mist' | 'night', Record<number, [Plate, Plate]>> = {
  mist: {
    1: [
      { k: 'embed-day-1', h: '76%', w: '62%', x: '1%', fade: '0% 0%' },
      { k: 'embed-day-4', h: '84%', w: '60%', x: '-4%', fade: '4% 40%' },
    ],
    2: [
      { k: 'embed-day-2', h: '82%', w: '64%', x: '-6%' },
      { k: 'embed-day-3', h: '80%', w: '58%', x: '-4%', fade: '0% 0%' },
    ],
    3: [
      { k: 'embed-day-5', h: '74%', w: '64%', x: '-5%', fade: '0% 26%' },
      { k: 'embed-day-8', h: '84%', w: '60%', x: '-5%', fade: '0% 14%' },
    ],
    4: [
      { k: 'embed-dusk-2', h: '80%', w: '74%', x: '-10%', fade: '8% 46%' },
      { k: 'embed-day-6', h: '88%', w: '62%', x: '-6%', fade: '0% 20%' },
    ],
    5: [
      { k: 'embed-day-7', h: '88%', w: '42%', x: '-2%', fade: '0% 0%', edge: true },
      { k: 'embed-dusk-1', h: '78%', w: '70%', x: '-8%' },
    ],
    6: [
      { k: 'embed-dusk-3', h: '70%', w: '78%', x: '-12%' },
      { k: 'embed-day-10', h: '88%', w: '56%', x: '-6%', fade: '0% 34%' },
    ],
  },
  night: {
    1: [{ k: 'embed-day-1' }, { k: 'embed-night-1' }],
    2: [{ k: 'embed-day-2' }, { k: 'embed-night-2' }],
    3: [{ k: 'embed-day-5' }, { k: 'embed-night-3' }],
    4: [{ k: 'embed-day-4' }, { k: 'embed-night-4' }],
    5: [{ k: 'embed-day-3' }, { k: 'embed-night-6' }],
    6: [{ k: 'embed-day-6' }, { k: 'embed-night-5' }],
  },
}

function ManifestoPlate({ plate, style }: { plate: Plate; style?: Record<string, MotionValue<number> | number> }) {
  const [f0, f1] = (plate.fade ?? '7% 48%').split(' ')
  const pa = (embedAspect as Record<string, number>)[plate.k] ?? 1.5
  const place = { '--pw': plate.w ?? '68%', '--ph': plate.h ?? '86%', '--px': plate.x ?? '-9%', '--pa': pa, '--pf0': f0, '--pf1': f1 } as unknown as MotionStyle
  return (
    <motion.div className={`iti-manifesto-plate ${plate.edge ? 'is-edge' : ''}`} style={{ ...place, ...style }} aria-hidden>
      <div className="iti-manifesto-art">
        <Picture k={plate.k} sizes="(min-width: 1024px) 66vw, 100vw" className="h-full w-full object-contain object-[right_bottom] max-lg:object-bottom" />
      </div>
    </motion.div>
  )
}

const MANIFESTO = {
  mission: { fill: [0.02, 0.32], body: [0.28, 0.36], out: [0.44, 0.5] },
  vision: { in: [0.48, 0.56], fill: [0.56, 0.84], body: [0.8, 0.88] },
}

function PurposeManifesto({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const { ref, p } = usePinned()
  // the ground the statements stand on: Mist Grey (the client's choice) or the original night
  const ground = useVariant('ground') === 2 ? 'night' : 'mist'
  const set = useVariant('plates')
  const [first, second] = MANIFESTO_SETS[ground][set] ?? MANIFESTO_SETS[ground][1]
  const tone = ground === 'mist' ? 'is-mist' : ''
  const seam = useTransform(p, [0, 0.08], [1, 0])
  const progress = useTransform(p, [0.02, 0.88], [0, 1])
  // the two plants change places with the two statements; each drifts a little as it is read
  const day = useTransform(p, [0.42, 0.52], [1, 0])
  const dayY = useTransform(p, [0, 0.52], [0, -26])
  const night = useTransform(p, [0.46, 0.58], [0, 1])
  const nightY = useTransform(p, [0.46, 1], [26, 0])

  if (reduce) {
    return (
      <section id="vision" className={`iti-purpose-story iti-manifesto relative isolate overflow-hidden py-28 text-white ${tone}`}>
        <ManifestoPlate plate={second} />
        <StillPair lang={lang} p={p} layout="manifesto" />
      </section>
    )
  }

  return (
    <section id="vision" ref={ref} className={`iti-purpose-story relative h-[240svh] text-white ${tone}`} aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}>
      <div className={`iti-manifesto sticky top-0 isolate h-[100svh] overflow-hidden ${tone}`}>
        <motion.div className="iti-purpose-seam absolute inset-x-0 top-0 -z-10 h-28" style={{ opacity: seam }} />
        <div className="iti-purpose-foot absolute inset-x-0 bottom-0 -z-10 h-40" />
        {/* the far side of the stage: the plant by day, then the plant under its lamps */}
        <ManifestoPlate key={first.k} plate={first} style={{ opacity: day, y: dayY }} />
        <ManifestoPlate key={second.k} plate={second} style={{ opacity: night, y: nightY }} />

        <div className="absolute inset-0 flex items-center max-lg:items-start max-lg:pt-[19svh]">
          <Pair lang={lang} p={p} beats={MANIFESTO} layout="manifesto" />
        </div>

        {/* a reading rule along the foot: it reports progress, it is not a control */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[9%] mx-auto hidden max-w-[1400px] px-8 lg:block lg:ps-32" aria-hidden>
          <div className="iti-manifesto-rule relative h-px bg-white/15">
            <motion.span className="absolute inset-y-0 start-0 w-full origin-left bg-[var(--iti-copper-soft)] rtl:origin-right" style={{ scaleX: progress }} />
          </div>
          <div className="iti-purpose-label mt-3 flex justify-between">
            <span>
              <span dir="ltr">01</span> {COPY.mission.short[lang]}
            </span>
            <span>
              <span dir="ltr">02</span> {COPY.vision.short[lang]}
            </span>
          </div>
        </div>
        <Thread from="88%" />
      </div>
    </section>
  )
}

/* ---------- Version 4 — The ITI arrow: the symbol's roof is an arrow; the light climbs it from base to tip ---------- */
/* Nothing here is tied to the scroll any more. The first design pinned the section and moved the symbol down     */
/* while the page went up, which read as confusing. Now the page scrolls normally and the section plays once,     */
/* by itself, when it arrives: one movement, in one direction — the light rises from the Mission to the Vision.   */

/** how far along the one reading each statement lights up (0 → 1) */
const ARROW_READ = { mission: [0.03, 0.4], vision: [0.56, 0.94] }
/** the stem's centre line in the official vector, base to tip */
const STEM_X = 460.9
const STEM_BASE = 800
const STEM_TIP = 6

function ArrowBlock({
  lang,
  which,
  read,
  still,
  dim,
  className,
  onHold,
}: {
  lang: Lang
  which: 'mission' | 'vision'
  read: MotionValue<number>
  still: boolean
  dim: boolean
  className: string
  onHold: (which: 'mission' | 'vision' | null) => void
}) {
  const s = COPY[which]
  const range = ARROW_READ[which]
  const body = useTransform(read, [range[1] - 0.1, range[1]], [0, 1])
  const bodyY = useTransform(read, [range[1] - 0.1, range[1]], [10, 0])
  return (
    <div className={`iti-arrow-block ${dim ? 'is-dim' : ''} ${className}`} onPointerEnter={() => onHold(which)} onPointerLeave={() => onHold(null)}>
      <h2 className="iti-eyebrow iti-eyebrow-light iti-purpose-eyebrow">
        <span dir="ltr">{which === 'mission' ? '01' : '02'}</span>
        <span aria-hidden className="h-px w-6 bg-white/30" />
        {s.eyebrow[lang]}
      </h2>
      <div className="mt-5">
        <Statement text={s.headline[lang]} p={read} range={range} still={still} accent={s.accent[lang]} className="iti-arrow-statement" />
      </div>
      <motion.p className="mt-5 max-w-[40ch] text-[1rem] leading-[1.7] text-white/70 sm:text-[1.05rem]" style={still ? undefined : { opacity: body, y: bodyY }}>
        {s.body[lang]}
      </motion.p>
    </div>
  )
}

function PurposeArrow({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const rtl = lang === 'ar'
  const ref = useRef<HTMLElement | null>(null)
  // `rise`: where the light is on the stem (0 base → 1 tip). `read`: how far the statements have been lit — it only ever goes forward
  const rise = useMotionValue(reduce ? 1 : 0)
  const read = useMotionValue(reduce ? 1 : 0)
  const [arrived, setArrived] = useState(reduce)
  const [hold, setHold] = useState<'mission' | 'vision' | null>(null)
  const played = useRef(reduce)
  const sparkY = useTransform(rise, [0, 1], [STEM_BASE, STEM_TIP])
  const litLen = useTransform(sparkY, (y) => STEM_BASE - y)
  const roofGlow = useTransform(rise, [0.78, 1], [0, 1])
  const [roof, pillarR, pillarL] = ICON_SHAPES

  // on arrival, once: the symbol draws itself, then the light climbs it while the two statements fill in turn
  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    let stop = () => {}
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        setArrived(true)
        const a = animate(rise, 1, { duration: 3.4, ease: EASE_IN_OUT, delay: 0.7 })
        const b = animate(read, 1, { duration: 3.4, ease: EASE_IN_OUT, delay: 0.7, onComplete: () => (played.current = true) })
        stop = () => {
          a.stop()
          b.stop()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      stop()
    }
  }, [reduce, rise, read])

  // afterwards: pointing at a statement brings the light to its end of the stem; letting go sends it back to the tip
  useEffect(() => {
    if (reduce || !played.current) return
    const c = animate(rise, hold === 'mission' ? 0.04 : 1, { duration: 0.9, ease: EASE_IN_OUT })
    return () => c.stop()
  }, [hold, reduce, rise])

  const draw = (delay: number) =>
    reduce ? {} : { initial: { pathLength: 0, opacity: 0 }, animate: arrived ? { pathLength: 1, opacity: 1 } : undefined, transition: { duration: 1.5, ease: EASE_IN_OUT, delay } }

  return (
    <section
      id="vision"
      ref={ref}
      className="iti-purpose-story iti-arrow-stage relative isolate overflow-hidden py-24 text-white sm:py-32"
      aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}
    >
      <div className="iti-purpose-seam absolute inset-x-0 top-0 -z-10 h-28" />
      <div className="iti-purpose-foot absolute inset-x-0 bottom-0 -z-10 h-40" />

      <div className="mx-auto grid max-w-[1400px] gap-x-8 gap-y-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-y-0">
        {/* the Mission stands at the base of the arrow… */}
        <ArrowBlock lang={lang} which="mission" read={read} still={reduce} dim={hold === 'vision'} onHold={setHold} className="lg:col-span-4 lg:self-end lg:pe-6 lg:pb-[3%]" />

        <div className="order-first mx-auto aspect-[682/836] h-[clamp(15rem,42svh,20rem)] lg:order-none lg:col-span-4 lg:h-[clamp(22rem,56svh,33rem)]" aria-hidden>
          <svg viewBox={ICON_FRAME} className={`h-full w-full overflow-visible ${rtl ? '-scale-x-100' : ''}`}>
            <defs>
              <linearGradient id="pa-lit" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#c27448" stopOpacity="0.2" />
                <stop offset="1" stopColor="#f0c9a2" />
              </linearGradient>
              <filter id="pa-glow" x="-50%" y="-10%" width="200%" height="120%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <g fill="rgb(255 255 255 / 0.03)" stroke="rgb(255 255 255 / 0.24)" strokeWidth="1.2">
              <motion.polygon points={roof} vectorEffect="non-scaling-stroke" {...draw(0)} />
              <motion.polygon points={pillarR} vectorEffect="non-scaling-stroke" {...draw(0.25)} />
              <motion.polygon points={pillarL} vectorEffect="non-scaling-stroke" {...draw(0.25)} />
            </g>
            {/* two leader lines: from the base out to the Mission, from the tip out to the Vision */}
            <g stroke="rgb(255 255 255 / 0.28)" strokeDasharray="2 7" vectorEffect="non-scaling-stroke">
              <motion.line x1={STEM_X - 16} y1={STEM_BASE} x2={96} y2={STEM_BASE} vectorEffect="non-scaling-stroke" {...draw(0.6)} />
              <motion.line x1={STEM_X + 16} y1={STEM_TIP} x2={826} y2={STEM_TIP} vectorEffect="non-scaling-stroke" style={reduce ? undefined : { opacity: roofGlow }} />
            </g>
            <circle cx={96} cy={STEM_BASE} r="5" fill="#e39a6b" />
            <motion.circle cx={826} cy={STEM_TIP} r="5" fill="#f0c9a2" style={reduce ? undefined : { opacity: roofGlow }} />
            {/* the roof warms to copper as the light reaches the tip */}
            <motion.polygon points={roof} fill="none" stroke="#e39a6b" strokeWidth="1.7" vectorEffect="non-scaling-stroke" style={{ opacity: roofGlow }} />
            <line x1={STEM_X} y1={STEM_BASE} x2={STEM_X} y2={STEM_TIP} stroke="rgb(255 255 255 / 0.14)" strokeDasharray="3 9" vectorEffect="non-scaling-stroke" />
            {/* the light: the stem lit behind it, and a spark at its head */}
            <motion.rect x={STEM_X - 1.5} width="3" fill="url(#pa-lit)" style={{ y: sparkY, height: litLen }} />
            <motion.rect x={STEM_X - 5} width="10" fill="#e39a6b" opacity="0.5" filter="url(#pa-glow)" style={{ y: sparkY, height: litLen }} />
            <motion.circle cx={STEM_X} r="24" fill="#e39a6b" className="iti-arrow-halo" filter="url(#pa-glow)" style={{ cy: sparkY }} />
            <motion.circle cx={STEM_X} r="7.5" fill="#fff4e8" style={{ cy: sparkY }} />
          </svg>
        </div>

        {/* …and the Vision at its tip */}
        <ArrowBlock lang={lang} which="vision" read={read} still={reduce} dim={hold === 'mission'} onHold={setHold} className="lg:col-span-4 lg:self-start lg:ps-8 lg:pt-[1%]" />
      </div>
      <Thread from="calc(100% - 6rem)" />
    </section>
  )
}

/* ---------- Version 5 — Corporate: a heading, two clear cards, a gentle reveal. Nothing pinned, nothing to learn ---------- */

function PurposeIcon({ which }: { which: 'mission' | 'vision' }) {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {which === 'mission' ? (
        <>
          {/* a target: what we do, and do well */}
          <circle cx="16" cy="16" r="11" />
          <circle cx="16" cy="16" r="6.5" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </>
      ) : (
        <>
          {/* a rising arrow over the horizon: where we are going */}
          <path d="M4 24h24" />
          <path d="M8 19l6-6 4 4 8-8" />
          <path d="M20 9h6v6" />
        </>
      )}
    </svg>
  )
}

function PurposeCorporate({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const t = COPY.purpose
  return (
    <section id="vision" className="iti-corporate relative isolate overflow-hidden pt-24 pb-28 text-white sm:pt-32 sm:pb-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="mx-auto max-w-[760px] text-center">
          <Reveal>
            <p className="iti-eyebrow iti-eyebrow-light justify-center">{t.eyebrow[lang]}</p>
          </Reveal>
          <SplitReveal text={t.title[lang]} emphasis={3} className="iti-h2 iti-corporate-title mt-5" />
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-[52ch] text-[length:var(--iti-fs-lead)] leading-[1.75] text-white/70">{t.lead[lang]}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 sm:mt-16 md:grid-cols-2 lg:gap-6">
          {(['mission', 'vision'] as const).map((which, i) => {
            const s = COPY[which]
            return (
              <motion.article
                key={which}
                className="iti-corporate-card group"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.12 }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="iti-corporate-icon">
                    <PurposeIcon which={which} />
                  </span>
                  <span className="text-[0.78rem] font-semibold tracking-[0.16em] text-white/40" dir="ltr">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-8 text-[0.74rem] font-bold tracking-[0.2em] text-[var(--iti-champagne)] uppercase rtl:text-[0.85rem] rtl:tracking-normal">
                  {s.eyebrow[lang]}
                </h3>
                <p className="mt-4 font-[family-name:var(--iti-head)] text-[clamp(1.3rem,1.85vw,1.65rem)] leading-[1.25] font-bold text-white">{s.headline[lang]}</p>
                <p className="mt-4 max-w-[48ch] text-[1rem] leading-[1.7] text-white/65">{s.body[lang]}</p>
                {/* a copper rule that grows under the card in focus */}
                <span className="iti-corporate-rule" aria-hidden />
              </motion.article>
            )
          })}
        </div>
      </div>
      <Thread from="calc(100% - 7rem)" />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Second round — versions 10 to 13. The brief: simple at first        */
/* glance, impressive in the execution. One idea each, built from type,*/
/* space and one moving element. The Values keep their own section     */
/* after every one of them.                                            */
/* ------------------------------------------------------------------ */

type Which = 'mission' | 'vision'
const PAIR = ['mission', 'vision'] as const

/** a statement whose words rise out of a mask as it comes into view; the accent phrase reads in copper */
function RiseStatement({ text, accent, className, delay = 0 }: { text: string; accent?: string; className: string; delay?: number }) {
  const reduce = !!useReducedMotion()
  const words = text.split(' ')
  const hot = accentMask(text, accent)
  return (
    <motion.p
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: Math.min(0.05, 0.5 / words.length), delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="-my-[0.16em] inline-block overflow-hidden py-[0.16em] align-bottom">
            <motion.span
              className={`inline-block ${hot[i] ? 'iti-purpose-accent' : ''}`}
              variants={reduce ? undefined : { hidden: { y: '115%' }, show: { y: '0%', transition: { duration: 0.95, ease: EASE_OUT } } }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </motion.p>
  )
}

function PurposeLabel({ lang, which, dark = true, className = '' }: { lang: Lang; which: Which; dark?: boolean; className?: string }) {
  return (
    <h2 className={`iti-eyebrow iti-purpose-eyebrow ${dark ? 'iti-eyebrow-light' : ''} ${className}`}>
      <span dir="ltr">{which === 'mission' ? '01' : '02'}</span>
      <span aria-hidden className={`h-px w-6 ${dark ? 'bg-white/30' : 'bg-[var(--iti-copper)]'}`} />
      {COPY[which].eyebrow[lang]}
    </h2>
  )
}

/* ---------- Version 10 — Compass: one instrument, two readings. South is where we stand, north is where we are heading ---------- */

const DIAL_R = 262
const DIAL_C = 2 * Math.PI * DIAL_R
/** the needle's travel along the pinned scroll: it rests on south, swings round by the west, settles on north */
const SWING = [0.36, 0.62]
const DIAL_DEGREES: [string, number, number][] = [
  ['000', 0, -226],
  ['090', 226, 0],
  ['180', 0, 226],
  ['270', -226, 0],
]

function CompassDial({ lang, angle, north, onPick }: { lang: Lang; angle: MotionValue<number>; north: boolean; onPick?: (which: Which) => void }) {
  const trail = useTransform(angle, (a) => DIAL_C * (1 - Math.max(0, Math.min(1, (a - 180) / 360))))
  const bearing = useTransform(angle, (a) => String(Math.round(((a % 360) + 360) % 360) % 360).padStart(3, '0'))
  const glowN = useTransform(angle, [300, 360], [0, 1])
  const glowS = useTransform(angle, [180, 240], [1, 0])
  const pole = (which: Which) => {
    const on = which === 'vision' ? north : !north
    const cls = `iti-compass-pole ${which === 'vision' ? 'is-north' : 'is-south'} ${on ? 'is-on' : ''}`
    const body = (
      <>
        <span dir="ltr">{which === 'mission' ? '01' : '02'}</span> {COPY[which].short[lang]}
      </>
    )
    return onPick ? (
      <button type="button" className={cls} onClick={() => onPick(which)} aria-pressed={on}>
        {body}
      </button>
    ) : (
      <span className={cls}>{body}</span>
    )
  }
  return (
    <div className="iti-compass-dial relative aspect-square w-full">
      <svg viewBox="-300 -300 600 600" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id="cp-pole" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f0c9a2" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e39a6b" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* the face: a rose so faint it is felt more than seen */}
        <path d="M0-170 24-24 170 0 24 24 0 170-24 24-170 0-24-24Z" fill="rgb(255 255 255 / 0.015)" stroke="#fff" strokeOpacity="0.13" />
        <path d="M0-96 14-14 96 0 14 14 0 96-14 14-96 0-14-14Z" fill="none" stroke="#fff" strokeOpacity="0.08" transform="rotate(45)" />
        <circle r="196" fill="none" stroke="#fff" strokeOpacity="0.1" strokeDasharray="1.5 7" />
        {/* the bezel: two hairlines and the graduations between them */}
        <circle r={DIAL_R} fill="none" stroke="#fff" strokeOpacity="0.22" />
        <circle r="288" fill="none" stroke="#fff" strokeOpacity="0.1" />
        {Array.from({ length: 120 }, (_, i) => {
          const long = i % 30 === 0
          const mid = i % 5 === 0
          return (
            <line
              key={i}
              y1={-DIAL_R - 4}
              y2={-DIAL_R - (long ? 21 : mid ? 14 : 8)}
              stroke="#fff"
              strokeOpacity={long ? 0.6 : mid ? 0.32 : 0.16}
              transform={`rotate(${i * 3})`}
            />
          )
        })}
        {DIAL_DEGREES.map(([t, dx, dy]) => (
          <text key={t} x={dx} y={dy} className="iti-compass-deg" textAnchor="middle" dominantBaseline="central">
            {t}
          </text>
        ))}
        {/* the light at whichever pole the needle is on */}
        <motion.circle cy={-DIAL_R} r="74" fill="url(#cp-pole)" style={{ opacity: glowN }} />
        <motion.circle cy={DIAL_R} r="74" fill="url(#cp-pole)" style={{ opacity: glowS }} />
        {/* the way already travelled, from south round to the needle */}
        <motion.circle
          r={DIAL_R}
          fill="none"
          stroke="#e39a6b"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray={DIAL_C}
          transform="rotate(90)"
          style={{ strokeDashoffset: trail }}
        />
      </svg>

      {/* the needle: an HTML layer, so it turns about the dial's own centre */}
      <motion.div className="absolute inset-0" style={{ rotate: angle }} aria-hidden>
        <svg viewBox="-300 -300 600 600" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="cp-needle" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-216">
              <stop offset="0" stopColor="#b8693d" />
              <stop offset="1" stopColor="#fbe6d0" />
            </linearGradient>
            <filter id="cp-glow" x="-400%" y="-400%" width="900%" height="900%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <circle cy="-216" r="14" fill="#e39a6b" opacity="0.6" filter="url(#cp-glow)" />
          <path d="M0 216 8 0H-8Z" fill="rgb(255 255 255 / 0.1)" stroke="#fff" strokeOpacity="0.28" strokeLinejoin="round" />
          <path d="M0-216 8 0H-8Z" fill="url(#cp-needle)" />
          <path d="M0-216V0" stroke="rgb(2 26 43 / 0.25)" />
          <circle r="11" fill="#062e47" stroke="#f0c9a2" strokeWidth="1.4" />
          <circle r="3" fill="#f0c9a2" />
        </svg>
      </motion.div>

      {pole('vision')}
      {pole('mission')}

      {/* the reading */}
      <p className="iti-compass-bearing" aria-hidden>
        <motion.span dir="ltr">{bearing}</motion.span>
        <span>°</span>
      </p>
    </div>
  )
}

/** one of the two texts that share the same place beside the dial */
function Reading({ on, past, children }: { on: boolean; past: boolean; children: ReactNode }) {
  return (
    <motion.div
      className="col-start-1 row-start-1"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : past ? -34 : 34, filter: on ? 'blur(0px)' : 'blur(6px)' }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      style={{ pointerEvents: on ? 'auto' : 'none' }}
    >
      {children}
    </motion.div>
  )
}

function CompassText({ lang, which, p, range, still }: { lang: Lang; which: Which; p: MotionValue<number>; range: Range; still: boolean }) {
  const s = COPY[which]
  return (
    <>
      <PurposeLabel lang={lang} which={which} />
      <div className="mt-5 lg:mt-7">
        <Statement text={s.headline[lang]} p={p} range={range} still={still} accent={s.accent[lang]} className="iti-compass-statement" />
      </div>
      <p className="mt-5 max-w-[46ch] text-[length:var(--iti-fs-lead)] leading-[1.7] text-white/70 lg:mt-7">{s.body[lang]}</p>
    </>
  )
}

function PurposeCompass({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const { ref, p } = usePinned()
  const [north, setNorth] = useState(false)
  useMotionValueEvent(p, 'change', (v) => setNorth(v >= 0.49))
  const raw = useTransform(p, SWING, [180, 360])
  // a light, under-damped spring: the needle overshoots a touch and settles, as a real one does
  const angle = useSpring(raw, { stiffness: 64, damping: 13, mass: 0.9 })
  const atNorth = useMotionValue(360)
  const seam = useTransform(p, [0, 0.08], [1, 0])
  // the instrument leans a few degrees towards the pointer
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const tiltX = useSpring(ty, { stiffness: 90, damping: 18 })
  const tiltY = useSpring(tx, { stiffness: 90, damping: 18 })
  const label = `${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`

  // reduced motion: nothing pinned — the instrument at rest on north, both statements set out in full
  if (reduce) {
    return (
      <section id="vision" className="iti-compass iti-on-night relative isolate overflow-hidden py-28 text-white" aria-label={label}>
        <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-12">
          <div className="flex flex-col gap-16 lg:col-span-6">
            {PAIR.map((which) => (
              <div key={which}>
                <CompassText lang={lang} which={which} p={p} range={[0, 1]} still />
              </div>
            ))}
          </div>
          <div className="mx-auto w-[min(70vw,26rem)] py-10 lg:col-span-6">
            <CompassDial lang={lang} angle={atNorth} north />
          </div>
        </div>
        <Thread from="calc(100% - 6rem)" />
      </section>
    )
  }

  const pick = (which: Which) => {
    const el = ref.current
    if (!el) return
    const span = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + span * (which === 'mission' ? 0.2 : 0.8), behavior: 'smooth' })
  }

  return (
    <section id="vision" ref={ref} className="iti-purpose-story iti-on-night relative h-[250svh] text-white" aria-label={label}>
      <div
        className="iti-compass sticky top-0 isolate h-[100svh] overflow-hidden"
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return
          const r = e.currentTarget.getBoundingClientRect()
          tx.set(((e.clientX - r.left) / r.width - 0.5) * 12)
          ty.set(((e.clientY - r.top) / r.height - 0.5) * -10)
        }}
        onPointerLeave={() => {
          tx.set(0)
          ty.set(0)
        }}
      >
        <motion.div className="iti-purpose-seam absolute inset-x-0 top-0 -z-10 h-28" style={{ opacity: seam }} />
        <div className="iti-purpose-foot absolute inset-x-0 bottom-0 -z-10 h-40" />

        <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-center gap-[clamp(3.25rem,8svh,4.5rem)] px-5 pt-[76px] pb-6 sm:px-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-0">
          <div className="order-last grid lg:order-first lg:col-span-6">
            <Reading on={!north} past={north}>
              <CompassText lang={lang} which="mission" p={p} range={[0.03, 0.26]} still={false} />
            </Reading>
            <Reading on={north} past={false}>
              <CompassText lang={lang} which="vision" p={p} range={[0.56, 0.8]} still={false} />
            </Reading>
          </div>
          <div className="mx-auto w-[min(60vw,29svh)] shrink-0 lg:col-span-6 lg:w-[min(80%,62svh)]" style={{ perspective: 1100 }}>
            <motion.div style={{ rotateX: tiltX, rotateY: tiltY }}>
              <CompassDial lang={lang} angle={angle} north={north} onPick={pick} />
            </motion.div>
          </div>
        </div>
        <Thread from="88%" />
      </div>
    </section>
  )
}

/* ---------- Version 11 — Duet: the two statements side by side on one plate; the one in hand takes the light ---------- */

function DuetGlyph({ which }: { which: Which }) {
  return (
    <svg viewBox="0 0 48 48" className="iti-duet-glyph" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {which === 'mission' ? (
        <>
          {/* a mark hit dead centre: what we do, and do well */}
          <circle pathLength={1} cx="24" cy="24" r="17" />
          <circle pathLength={1} cx="24" cy="24" r="9.5" />
          <circle cx="24" cy="24" r="2.4" fill="currentColor" stroke="none" />
        </>
      ) : (
        <>
          {/* a line that keeps rising past the horizon: where we are going */}
          <path pathLength={1} d="M6 38h36" />
          <path pathLength={1} d="M10 31l10-10 6 6 14-14" />
          <path pathLength={1} d="M31 13h9v9" />
        </>
      )}
    </svg>
  )
}

function PurposeDuet({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const t = COPY.purpose
  const [on, setOn] = useState<Which>('mission')
  return (
    <section id="vision" className="iti-duet iti-on-night relative isolate overflow-hidden pt-24 pb-28 text-white sm:pt-32 sm:pb-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid items-end gap-x-12 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="iti-eyebrow iti-eyebrow-light">{t.eyebrow[lang]}</p>
            </Reveal>
            <SplitReveal text={t.title[lang]} emphasis={3} className="iti-h2 iti-corporate-title mt-5" />
          </div>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="max-w-[42ch] text-[length:var(--iti-fs-lead)] leading-[1.75] text-white/65">{t.lead[lang]}</p>
          </Reveal>
        </div>

        <motion.div
          className="iti-duet-plate mt-12 sm:mt-16"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        >
          {PAIR.map((which, i) => {
            const s = COPY[which]
            return (
              <article
                key={which}
                className={`iti-duet-half iti-spot iti-spot-dark ${on === which ? 'is-on' : ''}`}
                onPointerEnter={() => setOn(which)}
                onPointerMove={spotlight}
              >
                {/* one copper bar for the pair: it slides to whichever statement is in hand */}
                {on === which && <motion.span layoutId="iti-duet-bar" className="iti-duet-bar" transition={{ type: 'spring', stiffness: 260, damping: 30 }} />}
                <div className="iti-duet-body">
                  <div className="flex items-center justify-between gap-6">
                    <PurposeLabel lang={lang} which={which} />
                    <DuetGlyph which={which} />
                  </div>
                  <div className="mt-10 sm:mt-14">
                    <RiseStatement text={s.headline[lang]} accent={s.accent[lang]} className="iti-duet-statement" delay={0.15 + i * 0.18} />
                  </div>
                  <p className="mt-5 max-w-[36ch] text-[1rem] leading-[1.7] text-white/65 sm:text-[1.05rem]">{s.body[lang]}</p>
                </div>
                <span className="iti-duet-num" dir="ltr" aria-hidden>
                  {which === 'mission' ? '01' : '02'}
                </span>
              </article>
            )
          })}
        </motion.div>
      </div>
      <Thread from="calc(100% - 7rem)" />
    </section>
  )
}

/* ---------- Version 12 — Editorial: white paper, two statements, and nothing else. Hierarchy does the work ---------- */

function PurposeEditorial({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const t = COPY.purpose
  const rule = (delay = 0) => (
    <motion.span
      className="iti-edit-rule"
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 1.3, ease: EASE_IN_OUT, delay }}
      aria-hidden
    />
  )
  return (
    <section id="vision" className="iti-edit relative overflow-hidden pt-24 pb-24 sm:pt-32 sm:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5 pb-10 lg:pb-14">
          <Reveal>
            <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-[40ch] text-[1rem] leading-[1.7] text-[var(--iti-ink-soft)]">{t.lead[lang]}</p>
          </Reveal>
        </div>

        {PAIR.map((which, i) => {
          const s = COPY[which]
          return (
            <article key={which} className="iti-edit-row group relative">
              {rule()}
              <div className="grid gap-x-10 gap-y-7 py-12 lg:grid-cols-12 lg:py-20">
                <h2 className="iti-edit-label lg:col-span-3">
                  <span className="iti-edit-no" dir="ltr">
                    {i === 0 ? '01' : '02'}
                  </span>
                  {s.short[lang]}
                </h2>
                <div className="lg:col-span-9">
                  <RiseStatement text={s.headline[lang]} accent={s.accent[lang]} className="iti-edit-statement" delay={0.1} />
                  <Reveal delay={0.3}>
                    <p className="mt-8 max-w-[50ch] text-[length:var(--iti-fs-lead)] leading-[1.75] text-[var(--iti-ink-soft)] lg:mt-10">{s.body[lang]}</p>
                  </Reveal>
                </div>
              </div>
            </article>
          )
        })}
        <div className="relative">{rule(0.1)}</div>
      </div>
    </section>
  )
}

/* ---------- Version 13 — Light: the two statements wait in the half-dark, each beside its photographs; the light is carried by the scroll ---------- */
/* Whatever reaches the middle of the screen is in full light; what is still arriving, or leaving, is in the half-dark.  */
/* The pointer no longer has to find anything. It has one small pleasure left: resting on a photograph turns the plate. */

/** three plates beside each statement — stock industrial photographs chosen to sit in the navy-and-copper palette */
const LIGHT_PLATES = {
  mission: ['purpose-mission', 'purpose-mission-2', 'purpose-mission-3'],
  vision: ['purpose-vision', 'purpose-vision-2', 'purpose-vision-3'],
} as const
type Plates = Record<'mission' | 'vision', number>

function LightCopy({
  lang,
  lit,
  p,
  plates,
  onTurn,
  onRest,
}: {
  lang: Lang
  lit: boolean
  p: MotionValue<number>
  plates: Plates
  onTurn?: (which: 'mission' | 'vision') => void
  onRest?: () => void
}) {
  return (
    <div className={`iti-light-copy ${lit ? 'is-lit' : ''}`} aria-hidden={lit || undefined}>
      <div className="mx-auto flex max-w-[1400px] flex-col gap-[clamp(3.5rem,9svh,6.5rem)] px-5 py-28 sm:px-8 lg:py-32">
        {PAIR.map((which, i) => {
          const s = COPY[which]
          const Tag = lit ? 'p' : 'h2'
          return (
            // the Mission reads first with its plate after it; the Vision sits below with its plate before it
            <div key={which} className="grid items-center gap-x-14 gap-y-9 lg:grid-cols-12">
              <div className={`iti-light-block lg:col-span-6 ${i ? 'lg:order-2 lg:col-start-7' : ''}`}>
                <Tag className="iti-light-label">
                  <span dir="ltr">{i === 0 ? '01' : '02'}</span>
                  <span aria-hidden className="h-px w-6 bg-current opacity-50" />
                  {s.eyebrow[lang]}
                </Tag>
                <Statement text={s.headline[lang]} p={p} range={[0, 1]} still accent={lit ? s.accent[lang] : undefined} className="iti-light-statement" />
                <p className="iti-light-body">{s.body[lang]}</p>
              </div>
              <div
                className={`iti-light-photo lg:col-span-5 ${i ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-8'}`}
                onPointerEnter={onTurn ? () => onTurn(which) : undefined}
                onPointerLeave={onRest}
              >
                {LIGHT_PLATES[which].map((k, n) => (
                  <div key={k} className={`iti-light-plate ${n === plates[which] ? 'is-on' : ''}`}>
                    <Picture k={k} sizes="(min-width: 1024px) 40vw, 100vw" className="h-full w-full object-cover" />
                  </div>
                ))}
                {/* which of the three plates is up */}
                <span className="iti-light-ticks">
                  {LIGHT_PLATES[which].map((k, n) => (
                    <i key={k} className={n === plates[which] ? 'is-on' : undefined} />
                  ))}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PurposeLight({ lang }: { lang: Lang }) {
  const reduce = !!useReducedMotion()
  const stage = useRef<HTMLElement | null>(null)
  const full = useMotionValue(1)
  // how far down the stage the light is (in its own pixels), and how far it has opened (0 → 1)
  const y = useMotionValue(0)
  const sy = useSpring(y, { stiffness: 210, damping: 30, mass: 0.7 })
  const open = useMotionValue(0)
  useMotionValueEvent(sy, 'change', (v) => stage.current?.style.setProperty('--ly', `${v}px`))
  useMotionValueEvent(open, 'change', (v) => stage.current?.style.setProperty('--lr', String(v)))

  // The light stays on the middle of the screen, so scrolling carries it down the section:
  // each statement comes out of the half-dark as it arrives, and goes back into it as it leaves.
  useEffect(() => {
    const el = stage.current
    if (!el || reduce) return
    let raf = 0
    let started = false
    const place = (jump = false) => {
      const at = window.innerHeight * 0.52 - el.getBoundingClientRect().top
      if (jump) {
        y.jump(at)
        sy.jump(at)
      } else y.set(at)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => place())
    }
    const io = new IntersectionObserver(([e]) => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (!e.isIntersecting) return
      place(!started)
      if (!started) {
        started = true
        animate(open, 1, { duration: 1.4, ease: EASE_OUT })
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reduce, y, sy, open])

  // resting the pointer on a photograph turns to the next plate, and keeps turning while it stays there
  const [plates, setPlates] = useState<Plates>({ mission: 0, vision: 0 })
  const turning = useRef(0)
  const rest = () => window.clearInterval(turning.current)
  const turn = (which: 'mission' | 'vision') => {
    const next = () => setPlates((at) => ({ ...at, [which]: (at[which] + 1) % LIGHT_PLATES[which].length }))
    rest()
    next()
    turning.current = window.setInterval(next, 1900)
  }
  useEffect(() => () => window.clearInterval(turning.current), [])

  return (
    <section
      id="vision"
      ref={stage}
      className={`iti-light iti-on-night relative isolate overflow-hidden text-white ${reduce ? 'is-still' : ''}`}
      aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}
    >
      <div className="iti-purpose-seam absolute inset-x-0 top-0 -z-10 h-28" />
      <div className="iti-light-glow absolute inset-0 -z-10" aria-hidden />
      <LightCopy lang={lang} lit={false} p={full} plates={plates} onTurn={turn} onRest={rest} />
      <LightCopy lang={lang} lit p={full} plates={plates} />
      <Thread from="calc(100% - 6rem)" />
    </section>
  )
}

/* ---------- Version 14 — Plant & port: the Mission beside the plant, the Vision beside the port, one continuous night ---------- */
/* Two photographs supplied by the client, in their own colours. Neither is framed: each runs off the far edge of the      */
/* screen and dissolves into the section's navy towards the text, and the two overlap where one statement hands over       */
/* to the other, so the section reads as one place rather than two rows.                                                   */
/* Nothing is pinned. The page scrolls normally; what the scroll drives is small and in step: each photograph comes in     */
/* from its own edge and settles, drifting a little slower than the page, while its statement fills word by word.          */
/* A single copper line leaves the Mission, crosses the stage and arrives at the Vision.                                   */

/** how far a band has come into the screen (0 as it arrives at the foot, 1 once it is well up), and its slow drift */
function useBand() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start 0.92', 'start 0.18'] })
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  return { ref, enter, pass }
}

function ReachPlate({
  k,
  side,
  enter,
  pass,
  still,
}: {
  k: string
  /** which edge of the screen the photograph runs off, in reading terms: the far edge (end) or the near one (start) */
  side: 'start' | 'end'
  enter: MotionValue<number>
  pass: MotionValue<number>
  still: boolean
}) {
  const el = useRef<HTMLDivElement | null>(null)
  // the reveal is a mask, so it is handed to CSS as one number; a spring keeps it from following the wheel tick for tick
  const open = useSpring(useTransform(enter, [0, 0.85], [0.08, 1]), { stiffness: 90, damping: 24, mass: 0.6 })
  useMotionValueEvent(open, 'change', (v) => el.current?.style.setProperty('--rv', v.toFixed(4)))
  useEffect(() => {
    el.current?.style.setProperty('--rv', still ? '1' : open.get().toFixed(4))
  }, [still, open])
  const y = useTransform(pass, [0, 1], ['5%', '-5%'])
  const scale = useTransform(enter, [0, 1], [1.09, 1])
  return (
    <div ref={el} className={`iti-reach-plate is-${side}`} aria-hidden>
      <motion.div className="iti-reach-art" style={still ? undefined : { y, scale }}>
        <Picture k={k} sizes="(min-width: 1024px) 70vw, 100vw" className="h-full w-full object-cover" />
      </motion.div>
    </div>
  )
}

function ReachCopy({ lang, which, enter, still }: { lang: Lang; which: 'mission' | 'vision'; enter: MotionValue<number>; still: boolean }) {
  const s = COPY[which]
  const labelOpacity = useTransform(enter, [0.05, 0.3], [0, 1])
  const labelY = useTransform(enter, [0.05, 0.3], [16, 0])
  const bodyOpacity = useTransform(enter, [0.62, 0.88], [0, 1])
  const bodyY = useTransform(enter, [0.62, 0.88], [16, 0])
  return (
    <>
      <motion.h2 className="iti-eyebrow iti-eyebrow-light iti-purpose-eyebrow" style={still ? undefined : { opacity: labelOpacity, y: labelY }}>
        <span dir="ltr">{which === 'mission' ? '01' : '02'}</span>
        <span aria-hidden className="h-px w-6 bg-white/30" />
        {s.eyebrow[lang]}
      </motion.h2>
      <div className="mt-7">
        <Statement text={s.headline[lang]} p={enter} range={[0.2, 0.72]} still={still} accent={s.accent[lang]} className="iti-reach-statement" />
      </div>
      <motion.p className="iti-reach-body mt-7" style={still ? undefined : { opacity: bodyOpacity, y: bodyY }}>
        {s.body[lang]}
      </motion.p>
    </>
  )
}

function PurposeReach({ lang }: { lang: Lang }) {
  const still = !!useReducedMotion()
  const mission = useBand()
  const vision = useBand()
  // the line between the two: down from the Mission, across the stage, down to the Vision
  const down = useTransform(mission.pass, [0.42, 0.62], [0, 1])
  const across = useTransform(vision.enter, [0, 0.4], [0, 1])
  const arrive = useTransform(vision.enter, [0.4, 0.7], [0, 1])
  const line = (v: MotionValue<number>, axis: 'scaleX' | 'scaleY') => (still ? undefined : { [axis]: v })

  return (
    <section id="vision" className="iti-reach relative isolate overflow-hidden text-white" aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}>
      <div className="iti-purpose-seam absolute inset-x-0 top-0 z-10 h-28" />

      {/* ---- 01 Mission: the statement at the reading edge, the plant running off the far edge ---- */}
      <div ref={mission.ref} className="iti-reach-band">
        <ReachPlate k="purpose-plant" side="end" enter={mission.enter} pass={mission.pass} still={still} />
        <div className="iti-reach-grid">
          <div className="iti-reach-copy lg:col-span-5">
            <div className="max-lg:hidden flex-1" />
            <ReachCopy lang={lang} which="mission" enter={mission.enter} still={still} />
            <div className="relative flex-1 max-lg:hidden" aria-hidden>
              <motion.span className="iti-reach-line absolute start-[7px] top-10 bottom-0 w-px origin-top" style={line(down, 'scaleY')} />
            </div>
          </div>
        </div>
      </div>

      {/* ---- 02 Vision: the port running off the near edge, the statement on the far side ---- */}
      <div ref={vision.ref} className="iti-reach-band is-second">
        <ReachPlate k="purpose-port" side="start" enter={vision.enter} pass={vision.pass} still={still} />
        <div className="iti-reach-grid">
          {/* the line crosses the stage along the seam between the two */}
          <div className="relative max-lg:hidden lg:col-span-7" aria-hidden>
            <motion.span className="iti-reach-line absolute start-[7px] end-[-7px] top-0 h-px origin-left rtl:origin-right" style={line(across, 'scaleX')} />
          </div>
          <div className="iti-reach-copy lg:col-span-5">
            <div className="relative flex-1 max-lg:hidden" aria-hidden>
              <motion.span className="iti-reach-line absolute start-[7px] top-0 bottom-10 w-px origin-top" style={line(arrive, 'scaleY')} />
            </div>
            <ReachCopy lang={lang} which="vision" enter={vision.enter} still={still} />
            <div className="max-lg:hidden flex-1" />
          </div>
        </div>
      </div>
      <Thread from="calc(100% - 5rem)" />
    </section>
  )
}

/* ---------- Version 15 — From Production to Global Reach ---------- */
/* One stage, one story told in two shapes. The Mission stands beside the silos: a vertical, architectural mass cut out  */
/* of its sky and built up out of the navy. The Vision opens beside the port: the same stage widening into a horizon.     */
/* The change between them is a single mask. The port first appears in the tall slot the silos stood in, and that slot    */
/* opens sideways and settles into a wide band — vertical becoming horizontal, production becoming reach.                 */
/* The stage is held while this plays (the scroll is the timeline), and three depths drift at three speeds.              */

/** a statement that arrives word by word, each word rising a little into place; driven by the scroll, not a clock */
function ScrollRise({ text, accent, p, range, still, className }: { text: string; accent?: string; p: MotionValue<number>; range: Range; still: boolean; className: string }) {
  const words = text.split(' ')
  const hot = accentMask(text, accent)
  const step = (range[1] - range[0]) / (words.length + 2)
  return (
    <p className={className}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {still ? (
            <span className={hot[i] ? 'iti-purpose-accent' : undefined}>{w}</span>
          ) : (
            <RiseWord word={w} p={p} from={range[0] + i * step} to={range[0] + (i + 3) * step} className={hot[i] ? 'iti-purpose-accent' : undefined} />
          )}
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </p>
  )
}

function RiseWord({ word, p, from, to, className }: { word: string; p: MotionValue<number>; from: number; to: number; className?: string }) {
  const opacity = useTransform(p, [from, to], [0, 1])
  const y = useTransform(p, [from, to], ['0.42em', '0em'])
  return (
    <motion.span className={`inline-block ${className ?? ''}`} style={{ opacity, y }}>
      {word}
    </motion.span>
  )
}

function SpanCopy({
  lang,
  which,
  p,
  beats,
  still,
}: {
  lang: Lang
  which: 'mission' | 'vision'
  p: MotionValue<number>
  /** when the label, the statement and the supporting line arrive, as shares of the held scroll */
  beats: { label: Range; words: Range; body: Range }
  still: boolean
}) {
  const s = COPY[which]
  const labelOpacity = useTransform(p, beats.label, [0, 1])
  const labelY = useTransform(p, beats.label, [14, 0])
  const bodyOpacity = useTransform(p, beats.body, [0, 1])
  const bodyY = useTransform(p, beats.body, [14, 0])
  return (
    <>
      <motion.h2 className="iti-eyebrow iti-eyebrow-light iti-purpose-eyebrow" style={still ? undefined : { opacity: labelOpacity, y: labelY }}>
        <span dir="ltr">{which === 'mission' ? '01' : '02'}</span>
        <span aria-hidden className="h-px w-6 bg-white/30" />
        {s.eyebrow[lang]}
      </motion.h2>
      <div className="mt-7">
        <ScrollRise text={s.headline[lang]} accent={s.accent[lang]} p={p} range={beats.words} still={still} className="iti-span-statement" />
      </div>
      <motion.p className="iti-span-body mt-7" style={still ? undefined : { opacity: bodyOpacity, y: bodyY }}>
        {s.body[lang]}
      </motion.p>
    </>
  )
}

/** the silos' own proportions, so their box hugs the cut-out (see scripts/build-embeds.mjs) */
const SILOS_ASPECT = (embedAspect as Record<string, number>)['embed-silos'] ?? 1.17

function PurposeSpan({ lang }: { lang: Lang }) {
  const still = !!useReducedMotion()
  const { ref, p } = usePinned()
  // the silos are already going up as the stage scrolls into place, so it never arrives empty
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.05'] })
  const art = useRef<HTMLDivElement | null>(null)
  const rise = useSpring(useTransform(arrive, [0, 1], [0, 1]), { stiffness: 80, damping: 24, mass: 0.7 })
  const open = useSpring(useTransform(p, [0.42, 0.68], [0, 1]), { stiffness: 110, damping: 28, mass: 0.6 })
  useMotionValueEvent(rise, 'change', (v) => art.current?.style.setProperty('--rv', v.toFixed(4)))
  useMotionValueEvent(open, 'change', (v) => art.current?.style.setProperty('--op', v.toFixed(4)))

  // three depths, three speeds: the ground light, the silos, the port
  const glowY = useTransform(p, [0, 1], ['0%', '-10%'])
  const silosY = useTransform(p, [0, 0.62], ['1.5%', '-3.5%'])
  const silosOut = useTransform(p, [0.46, 0.6], [1, 0])
  const silosScale = useTransform(p, [0.42, 0.62], [1, 1.05])
  const portX = useTransform(p, [0.42, 1], ['3%', '-2%'])
  const portScale = useTransform(p, [0.42, 0.74], [1.1, 1])
  // the Mission leaves as the slot opens
  const missionOut = useTransform(p, [0.4, 0.5], [1, 0])
  const missionY = useTransform(p, [0.4, 0.5], [0, -28])

  if (still) {
    // reduced motion: nothing is held and nothing moves — the two statements one under the other, each beside its picture
    return (
      <section id="vision" className="iti-span is-still relative isolate overflow-hidden text-white" aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}>
        <div className="iti-purpose-seam absolute inset-x-0 top-0 z-10 h-28" />
        <div className="iti-span-art" style={{ '--rv': 1, '--op': 0 } as unknown as CSSProperties} aria-hidden>
          <div className="iti-span-silos" style={{ aspectRatio: SILOS_ASPECT }}>
            <Picture k="embed-silos" sizes="60vw" className="h-full w-full object-contain object-[right_bottom]" />
          </div>
        </div>
        <div className="iti-span-grid py-32">
          <div className="lg:col-span-5">
            <SpanCopy lang={lang} which="mission" p={p} beats={{ label: [0, 1], words: [0, 1], body: [0, 1] }} still />
          </div>
          <div className="mt-24 lg:col-span-5 lg:col-start-8 lg:mt-40">
            <SpanCopy lang={lang} which="vision" p={p} beats={{ label: [0, 1], words: [0, 1], body: [0, 1] }} still />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="vision" ref={ref} className="iti-span-track relative h-[290svh] text-white" aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}>
      <div className="iti-span sticky top-0 isolate h-[100svh] overflow-hidden">
        <div className="iti-purpose-seam absolute inset-x-0 top-0 z-10 h-28" />

        {/* ---- the picture plane: drawn for a left-to-right page and mirrored whole for Arabic ---- */}
        <div ref={art} className="iti-span-art" aria-hidden>
          <motion.div className="iti-span-glow" style={{ y: glowY }} />
          {/* the port: first seen through the slot the silos stood in, then opened into a horizon */}
          <div className="iti-span-port">
            <motion.div className="iti-span-port-art" style={{ x: portX, scale: portScale }}>
              <Picture k="purpose-harbour" sizes="130vw" className="h-full w-full object-cover" />
            </motion.div>
          </div>
          {/* the silos: cut from their sky, built up from the ground */}
          <motion.div className="iti-span-silos" style={{ aspectRatio: SILOS_ASPECT, y: silosY, opacity: silosOut, scale: silosScale }}>
            <Picture k="embed-silos" sizes="(min-width: 1024px) 60vw, 90vw" className="h-full w-full object-contain object-[right_bottom]" />
          </motion.div>
        </div>

        {/* ---- the words: the Mission at the reading edge, the Vision on the far side ---- */}
        <div className="iti-span-grid h-full">
          <motion.div className="iti-span-copy lg:col-span-5" style={{ opacity: missionOut, y: missionY }}>
            <SpanCopy lang={lang} which="mission" p={p} beats={{ label: [0, 0.06], words: [0.03, 0.24], body: [0.2, 0.3] }} still={false} />
          </motion.div>
          <div className="iti-span-copy is-second lg:col-span-5 lg:col-start-8">
            <SpanCopy lang={lang} which="vision" p={p} beats={{ label: [0.6, 0.68], words: [0.64, 0.84], body: [0.8, 0.9] }} still={false} />
          </div>
        </div>
        <Thread from="90%" />
      </div>
    </section>
  )
}

/* ---------- Version 16 — Industrial Precision & Connectivity ---------- */
/* Two aerial photographs, seen through three apertures. For the Mission the apertures are three upright bars, their     */
/* tops cut along one line that climbs across them: silos, production, vertical. For the Vision the same three turn      */
/* onto their sides and become three long strips, their ends cut along one line that runs away to the far edge: a berth, */
/* a ship, reach. The cut is always the same angle — the slope of the roof in the Group's mark (ITI_SLOPE in the CSS) —  */
/* so the shapes belong to the identity without drawing the mark itself.                                                 */
/* Nothing here is decoration: there are no frames, lines or patterns, only the photograph, the navy between the         */
/* apertures, and the type in the open ground they leave. The stage is held while the three apertures turn, one after    */
/* the other, and each photograph eases back in scale as it settles.                                                     */

/** one aperture's share of a 0 → 1 movement: each starts a little after the one before it */
const stagger = (v: number, i: number, lag: number) => Math.max(0, Math.min(1, (v - i * lag) / (1 - 2 * lag)))

function PrecisionPlane({ still, grow, turn, zoom }: { still?: { turn: 0 | 1 }; grow?: MotionValue<number>; turn?: MotionValue<number>; zoom?: MotionValue<number> }) {
  const el = useRef<HTMLDivElement | null>(null)
  const set = (name: string, v: number) => el.current?.style.setProperty(name, v.toFixed(4))
  const write = (g: number, t: number, z: number) => {
    for (let i = 0; i < 3; i++) {
      set(`--g${i + 1}`, stagger(g, i, 0.16))
      set(`--t${i + 1}`, stagger(t, i, 0.14))
    }
    set('--z', z)
  }
  useEffect(() => {
    if (still) write(1, still.turn, 1)
    else write(grow?.get() ?? 0, turn?.get() ?? 0, zoom?.get() ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const noop = useMotionValue(0)
  useMotionValueEvent(grow ?? noop, 'change', (g) => !still && write(g, turn?.get() ?? 0, zoom?.get() ?? 0))
  useMotionValueEvent(turn ?? noop, 'change', (t) => !still && write(grow?.get() ?? 1, t, zoom?.get() ?? 0))
  useMotionValueEvent(zoom ?? noop, 'change', (z) => !still && write(grow?.get() ?? 1, turn?.get() ?? 0, z))
  return (
    <div ref={el} className="iti-prec-plane" aria-hidden>
      {[1, 2, 3].map((n) => (
        <div key={n} className={`iti-prec-aperture is-${n}`}>
          {/* the berth lies under the silos in every aperture; the silos clear as that aperture turns */}
          <div className="iti-prec-photo is-berth">
            <Picture k="purpose-berth" sizes="(min-width: 1024px) 82vw, 130vw" className="h-full w-full object-cover" />
          </div>
          <div className="iti-prec-photo is-ring">
            <Picture k="purpose-ring" sizes="(min-width: 1024px) 60vw, 110vw" className="h-full w-full object-cover" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PurposePrecision({ lang }: { lang: Lang }) {
  const still = !!useReducedMotion()
  const { ref, p } = usePinned()
  // the bars are already rising as the stage scrolls into place
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ['start 0.85', 'start 0'] })
  const grow = useSpring(arrive, { stiffness: 90, damping: 26, mass: 0.6 })
  const turn = useSpring(useTransform(p, [0.4, 0.72], [0, 1]), { stiffness: 120, damping: 30, mass: 0.6 })
  const zoom = useTransform(p, [0, 0.4, 0.42, 1], [0, 1, 0, 1])
  const missionOut = useTransform(p, [0.38, 0.47], [1, 0])
  const missionY = useTransform(p, [0.38, 0.47], [0, -24])
  const label = `${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`

  if (still) {
    // reduced motion: nothing is held and nothing turns — each statement with its own three apertures, one under the other
    return (
      <section id="vision" className="iti-prec-track relative text-white" aria-label={label}>
        <div className="iti-prec relative isolate h-[100svh] overflow-hidden">
          <div className="iti-purpose-seam absolute inset-x-0 top-0 z-10 h-28" />
          <PrecisionPlane still={{ turn: 0 }} />
          <div className="iti-prec-grid h-full">
            <div className="iti-prec-copy lg:col-span-5">
              <SpanCopy lang={lang} which="mission" p={p} beats={{ label: [0, 1], words: [0, 1], body: [0, 1] }} still />
            </div>
          </div>
        </div>
        <div className="iti-prec relative isolate h-[100svh] overflow-hidden">
          <PrecisionPlane still={{ turn: 1 }} />
          <div className="iti-prec-grid h-full">
            <div className="iti-prec-copy is-second lg:col-span-5 lg:col-start-8">
              <SpanCopy lang={lang} which="vision" p={p} beats={{ label: [0, 1], words: [0, 1], body: [0, 1] }} still />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="vision" ref={ref} className="iti-prec-track relative h-[290svh] text-white" aria-label={label}>
      <div className="iti-prec sticky top-0 isolate h-[100svh] overflow-hidden">
        <div className="iti-purpose-seam absolute inset-x-0 top-0 z-10 h-28" />
        <PrecisionPlane grow={grow} turn={turn} zoom={zoom} />
        <div className="iti-prec-grid h-full">
          <motion.div className="iti-prec-copy lg:col-span-5" style={{ opacity: missionOut, y: missionY }}>
            <SpanCopy lang={lang} which="mission" p={p} beats={{ label: [0, 0.06], words: [0.03, 0.24], body: [0.2, 0.3] }} still={false} />
          </motion.div>
          <div className="iti-prec-copy is-second lg:col-span-5 lg:col-start-8">
            <SpanCopy lang={lang} which="vision" p={p} beats={{ label: [0.64, 0.72], words: [0.68, 0.87], body: [0.84, 0.93] }} still={false} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Version 17 — One Continuous Industrial Story ---------- */
/* One held frame, two shots, cut like a film. It opens on the plant at dusk, standing in the far two thirds of the      */
/* frame with the Mission set against the navy beside it. As the page is scrolled the camera keeps pushing in and        */
/* begins to travel; a soft-edged wipe crosses the frame in the same direction and the port comes through it, pulling    */
/* back until it runs edge to edge. The Vision is set where the Mission stood, on the open water.                        */
/* Both photographs share the same hour — blue sky, sodium light — which is what lets one dissolve into the other.       */
/* The scroll is the only clock: nothing plays on its own, and the frame is held for little more than one screen.        */
/* Below desktop width, and for anyone who asks for reduced motion, nothing is held: the two statements are set one      */
/* under the other, each with its photograph.                                                                            */

const STORY_SHOTS = {
  works: { k: 'purpose-works', sizes: '(min-width: 1024px) 82vw, 190vw' },
  terminal: { k: 'purpose-terminal', sizes: '(min-width: 1024px) 100vw, 200vw' },
} as const

function useMatch(query: string) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const sync = () => setOn(m.matches)
    sync()
    m.addEventListener('change', sync)
    return () => m.removeEventListener('change', sync)
  }, [query])
  return on
}

/** one shot: the frame it is seen through (which blends its edges into the navy) and the camera inside it */
function StoryShot({ which, style, cam }: { which: keyof typeof STORY_SHOTS; style?: MotionStyle; cam?: MotionStyle }) {
  const shot = STORY_SHOTS[which]
  return (
    <motion.div className={`iti-story-shot is-${which}`} style={style}>
      <motion.div className="iti-story-cam" style={cam}>
        <Picture k={shot.k} sizes={shot.sizes} className="h-full w-full object-cover" />
      </motion.div>
    </motion.div>
  )
}

const STORY_SET = { label: [0, 1], words: [0, 1], body: [0, 1] }

/** the film: desktop, motion allowed */
function StoryFilm({ lang }: { lang: Lang }) {
  const { ref, p } = usePinned()
  // the opening shot and the Mission come up while the frame is still scrolling into place, so it never arrives empty
  const { scrollYProgress: arrive } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.1'] })
  // one eased reading of the scroll drives picture and type alike, so they cannot drift apart
  const film = useSpring(p, { stiffness: 140, damping: 32, mass: 0.5 })
  const plane = useRef<HTMLDivElement | null>(null)
  const wipe = useTransform(film, [0.28, 0.62], [0, 1])
  useMotionValueEvent(wipe, 'change', (v) => plane.current?.style.setProperty('--wipe', v.toFixed(4)))
  useEffect(() => {
    plane.current?.style.setProperty('--wipe', wipe.get().toFixed(4))
  }, [wipe])

  // the plant: a slow push-in from the moment it appears, then the camera starts to travel
  const worksIn = useTransform(arrive, [0.05, 0.7], [0, 1])
  const worksOut = useTransform(film, [0.46, 0.62], [1, 0])
  const worksOpacity = useTransform([worksIn, worksOut], ([a, b]: number[]) => Math.min(a, b))
  const worksScale = useTransform([arrive, film], ([a, f]: number[]) => 1 + 0.035 * a + 0.085 * Math.min(1, f / 0.62))
  const worksX = useTransform(film, [0.28, 0.62], ['0%', '-4%'])
  const worksY = useTransform(arrive, [0, 1], ['3%', '0%'])
  // the port: arrives still travelling the same way, and keeps pulling back to the end
  const portX = useTransform(film, [0.28, 0.72], ['5%', '0%'])
  const portScale = useTransform(film, [0.28, 1], [1.13, 1.02])
  // the words sit nearer than the picture: they drift a little on their own, and the Mission leaves ahead of the wipe
  const missionOpacity = useTransform(film, [0.34, 0.44], [1, 0])
  const missionY = useTransform(film, [0, 0.34, 0.44], [0, -10, -34])
  const reelA = useTransform(film, [0, 0.45], [0, 1])
  const reelB = useTransform(film, [0.45, 0.96], [0, 1])

  return (
    <section id="vision" ref={ref} className="iti-story-track relative h-[240svh] text-white" aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}>
      <div className="iti-story sticky top-0 isolate h-[100svh] overflow-hidden">
        <div className="iti-purpose-seam absolute inset-x-0 top-0 z-10 h-28" />

        {/* ---- the picture plane: laid out for a left-to-right page and mirrored whole for Arabic ---- */}
        <div ref={plane} className="iti-story-plane" aria-hidden>
          <StoryShot which="works" style={{ opacity: worksOpacity }} cam={{ scale: worksScale, x: worksX, y: worksY }} />
          <div className="iti-story-wipe">
            <StoryShot which="terminal" cam={{ scale: portScale, x: portX }} />
          </div>
          <div className="iti-story-veil" />
        </div>

        {/* ---- the words: one place in the frame, the Vision taking over where the Mission stood ---- */}
        <div className="iti-story-grid h-full">
          <motion.div className="iti-story-copy" style={{ opacity: missionOpacity, y: missionY }}>
            <SpanCopy lang={lang} which="mission" p={arrive} beats={{ label: [0.36, 0.56], words: [0.46, 0.94], body: [0.84, 1] }} still={false} />
          </motion.div>
          <div className="iti-story-copy">
            <SpanCopy lang={lang} which="vision" p={film} beats={{ label: [0.52, 0.6], words: [0.56, 0.78], body: [0.74, 0.84] }} still={false} />
          </div>
          {/* where we are in the film: two short hairlines, the copper filling as it plays */}
          <div className="iti-story-reel" aria-hidden>
            <span>
              <motion.i style={{ scaleX: reelA }} />
            </span>
            <span>
              <motion.i style={{ scaleX: reelB }} />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** the same story with nothing held: phones, tablets, short windows and reduced motion */
function StoryFlat({ lang, still }: { lang: Lang; still: boolean }) {
  const p = useMotionValue(1)
  return (
    <section id="vision" className="iti-story is-flat relative isolate overflow-hidden text-white" aria-label={`${COPY.mission.eyebrow[lang]} · ${COPY.vision.eyebrow[lang]}`}>
      <div className="iti-purpose-seam absolute inset-x-0 top-0 z-10 h-28" />
      {PAIR.map((which) => {
        const copy = <SpanCopy lang={lang} which={which} p={p} beats={STORY_SET} still />
        return (
          <div key={which} className={`iti-story-scene is-${which}`}>
            <div className="iti-story-grid">{still ? <div className="iti-story-copy">{copy}</div> : <Reveal className="iti-story-copy">{copy}</Reveal>}</div>
            <div className="iti-story-plane" aria-hidden>
              <StoryShot which={which === 'mission' ? 'works' : 'terminal'} />
              <div className="iti-story-veil" />
            </div>
          </div>
        )
      })}
    </section>
  )
}

function PurposeStory({ lang }: { lang: Lang }) {
  const still = !!useReducedMotion()
  // the frame is only held where there is room for it: a desktop-width window that is not too short
  const roomy = useMatch('(min-width: 1024px) and (min-height: 560px)')
  return roomy && !still ? <StoryFilm lang={lang} /> : <StoryFlat lang={lang} still={still} />
}

/** Vision & Mission — the version comes from the address (?purpose=N); 1 is the current design.
 *  Numbers are stable: a version that is dropped keeps its number retired (3, 6, 7, 8, 9), so "version 5" always means the same design. */
export function ItiVision({ lang }: { lang: Lang }) {
  const v = useVariant('purpose')
  if (v === 2) return <PurposeManifesto lang={lang} />
  if (v === 4) return <PurposeArrow lang={lang} />
  if (v === 5) return <PurposeCorporate lang={lang} />
  if (v === 10) return <PurposeCompass lang={lang} />
  if (v === 11) return <PurposeDuet lang={lang} />
  if (v === 12) return <PurposeEditorial lang={lang} />
  if (v === 13) return <PurposeLight lang={lang} />
  if (v === 14) return <PurposeReach lang={lang} />
  if (v === 15) return <PurposeSpan lang={lang} />
  if (v === 16) return <PurposePrecision lang={lang} />
  if (v === 17) return <PurposeStory lang={lang} />
  return <PurposeHorizon lang={lang} />
}
