import { useId, useState, type ReactNode, type RefObject } from 'react'
import { motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ICON_FRAME, ICON_SHAPES } from './ItiLogo'

/* ------------------------------------------------------------------ */
/* About — the ITI symbol as an engineered structure: four plates     */
/* with real thickness, already standing; they part and cast shadows  */
/* as the pointer moves over the section                              */
/* ------------------------------------------------------------------ */

type Pt = [number, number]

const pts = (s: string): Pt[] => {
  const n = s.trim().split(/\s+/).map(Number)
  const out: Pt[] = []
  for (let i = 0; i < n.length; i += 2) out.push([n[i], n[i + 1]])
  return out
}

/** Plate thickness, in the official vector's units (light falls from the upper left) */
const DEPTH: Pt = [11, 13]

/* The official roof polygon, cut where the stem leaves the cap: together they redraw it exactly */
const ROOF_CAP = pts(
  '790.14 210.18 461.07 0 131.79 210.18 132.25 210.73 131.79 210.73 131.79 326.41 263.26 326.41 263.26 266.16 352.87 211.84 569.05 211.79 658.66 266.16 658.66 326.41 790.14 326.41 790.14 210.73 789.68 210.73',
)
/** the stem starts inside the cap, so the two plates never show a seam */
const STEM = pts('352.87 190 352.87 741.76 460.85 810.71 569.05 741.76 569.05 190')
const PILLAR_R = pts(ICON_SHAPES[1])
const PILLAR_L = pts(ICON_SHAPES[2])

const toAttr = (p: Pt[]) => p.map(([x, y]) => `${x} ${y}`).join(' ')

/** Side faces of an extruded plate: only the edges that face the extrusion, shaded by how far they turn from the light */
function sideFaces(poly: Pt[], hidden: number[] = []) {
  let area = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    area += x1 * y2 - x2 * y1
  }
  const out: { d: string; down: number }[] = []
  for (let i = 0; i < poly.length; i++) {
    if (hidden.includes(i)) continue
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const ex = b[0] - a[0]
    const ey = b[1] - a[1]
    const len = Math.hypot(ex, ey)
    if (len < 2) continue
    const nx = (area > 0 ? ey : -ey) / len
    const ny = (area > 0 ? -ex : ex) / len
    if (nx * DEPTH[0] + ny * DEPTH[1] <= 0) continue
    const [dx, dy] = DEPTH
    out.push({
      d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${b[0] + dx} ${b[1] + dy}L${a[0] + dx} ${a[1] + dy}Z`,
      down: Math.max(0, Math.min(1, ny)),
    })
  }
  return out
}

type Part = {
  key: string
  poly: Pt[]
  hiddenEdges?: number[]
  material: 'steel' | 'navy'
  /** how much the plate leans with the pointer, relative to the others */
  depth: number
}

/* back to front: the columns, the core, then the cap — the nearer the plate, the further it leans */
const PARTS: Part[] = [
  { key: 'pillar-l', poly: PILLAR_L, material: 'navy', depth: 0.25 },
  { key: 'pillar-r', poly: PILLAR_R, material: 'navy', depth: 0.25 },
  { key: 'stem', poly: STEM, hiddenEdges: [4], material: 'steel', depth: 0.55 },
  { key: 'roof', poly: ROOF_CAP, hiddenEdges: [8], material: 'steel', depth: 1 },
]

const MATERIAL = {
  steel: {
    top: 'color-mix(in oklab, var(--iti-steel) 86%, var(--iti-mist))',
    bottom: 'var(--iti-steel)',
    sideLit: 'color-mix(in oklab, var(--iti-steel) 45%, var(--iti-navy))',
    sideShade: 'var(--iti-navy)',
    sheen: 0.12,
  },
  navy: {
    top: 'color-mix(in oklab, var(--iti-navy) 88%, var(--iti-steel))',
    bottom: 'var(--iti-navy)',
    sideLit: 'color-mix(in oklab, var(--iti-navy) 86%, #000)',
    sideShade: 'color-mix(in oklab, var(--iti-navy) 70%, #000)',
    sheen: 0.07,
  },
} as const

function Plate({ part, uid, still }: { part: Part; uid: string; still: boolean }) {
  const m = MATERIAL[part.material]
  const faces = sideFaces(part.poly, part.hiddenEdges)
  const face = toAttr(part.poly)
  const id = `${uid}-${part.key}`
  return (
    <svg viewBox={ICON_FRAME} className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        {/* one light for the whole structure, so plates of the same material read as one surface */}
        <linearGradient id={`${id}-face`} gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="520" y2="811">
          <stop offset="0" style={{ stopColor: m.top }} />
          <stop offset="1" style={{ stopColor: m.bottom }} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={m.sheen} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <polygon points={face} />
        </clipPath>
      </defs>

      {/* thickness */}
      {faces.map((f, i) => (
        <path
          key={i}
          d={f.d}
          style={{ fill: `color-mix(in oklab, ${m.sideShade} ${Math.round(f.down * 100)}%, ${m.sideLit})` }}
          stroke="none"
        />
      ))}
      {/* front plate */}
      <polygon points={face} fill={`url(#${id}-face)`} />
      {/* a slow pass of light across the plate, now and then */}
      {!still && (
        <g clipPath={`url(#${id}-clip)`}>
          <g transform="rotate(-24 461 405)">
            <rect className="iti-struct-sheen" x="-120" y="-300" width="260" height="1400" fill={`url(#${id}-sheen)`} />
          </g>
        </g>
      )}
    </svg>
  )
}

function Layer({ part, px, py, still, children }: { part: Part; px: MotionValue<number>; py: MotionValue<number>; still: boolean; children: ReactNode }) {
  const x = useTransform(px, (v) => v * part.depth * 0.9)
  const y = useTransform(py, (v) => v * part.depth * 0.9)
  // the light sits opposite the pointer: each plate's shadow falls away from it, longer for the nearer plates
  const sx = useTransform(px, (v) => -v * part.depth * 0.8)
  const sy = useTransform(py, (v) => 6 + part.depth * 8 - v * part.depth * 0.8)
  const blur = 10 + part.depth * 12
  const shadow = useMotionTemplate`drop-shadow(${sx}px ${sy}px ${blur}px rgb(5 53 82 / ${0.12 + part.depth * 0.1}))`
  return (
    <motion.div className="absolute inset-0" style={still ? undefined : { x, y, filter: shadow }}>
      {children}
    </motion.div>
  )
}

export default function AboutStructure({
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
  const uid = useId().replace(/:/g, '')
  const [seen, setSeen] = useState(false)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 0.5, 1], [24, 0, -24])
  // below desktop the structure shares a row with the eyebrow, so it must not drift into the headline
  const [wide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches)
  // a few degrees at most: the structure turns towards the light, it never spins
  const rotateY = useTransform(px, (v) => v * -0.3)
  const rotateX = useTransform(py, (v) => v * 0.36)
  return (
    <motion.div
      className="pointer-events-none relative ms-auto -mb-5 aspect-[682/836] h-28 sm:h-40 lg:absolute lg:end-10 lg:top-2 lg:mb-0 lg:h-[320px] xl:end-20 xl:h-[350px]"
      style={reduce || !wide ? undefined : { y: drift }}
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      onViewportEnter={() => setSeen(true)}
      viewport={{ once: true, margin: '-12% 0px' }}
      aria-hidden
    >
      <motion.div
        className={`iti-struct relative h-full w-full ${seen && !reduce ? 'is-assembled' : ''}`}
        style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1400 }}
      >
        {PARTS.map((p) => (
          <Layer key={p.key} part={p} px={px} py={py} still={reduce}>
            <Plate part={p} uid={uid} still={reduce} />
          </Layer>
        ))}
      </motion.div>
    </motion.div>
  )
}
