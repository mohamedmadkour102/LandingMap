import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import regionsTopo from './geo/regions.topo.json'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { useCountUp } from '../../hooks/useCountUp'
import { Picture, photoUrl } from './media'
import { onAssetRequest, takePendingAsset } from './mapBus'
import { createEarthRenderer, type EarthRenderer } from './earthGL'
import {
  ASSETS,
  CITY_LABELS,
  COPY,
  LANES,
  LANE_ORIGIN,
  MARKETS,
  PLACEHOLDER_URL,
  SECTORS,
  SECTOR_ORDER,
  type Asset,
  type Lang,
  type Market,
  type MarketId,
  type SectorId,
} from './content'

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const W = 1000
const H = 860
const RAD = Math.PI / 180

type LatLng = [number, number]
type CountryFeature = Feature<Geometry, object> & { id?: string | number }

const topo = regionsTopo as unknown as Topology<{ countries: GeometryCollection }>
const COUNTRIES = (feature(topo, topo.objects.countries) as FeatureCollection<Geometry, object>).features.map((f, i) => {
  const cf = f as CountryFeature
  const [clng, clat] = d3.geoCentroid(cf)
  const [[w, s], [e, n]] = d3.geoBounds(cf)
  const reach = Math.max(
    d3.geoDistance([clng, clat], [w, s]),
    d3.geoDistance([clng, clat], [e, n]),
    d3.geoDistance([clng, clat], [w, n]),
    d3.geoDistance([clng, clat], [e, s]),
  )
  // a few territories (e.g. Kosovo, N. Cyprus) carry no ISO id — keep their keys unique
  return { iso: cf.id != null && String(cf.id) !== 'undefined' ? String(cf.id) : `x${i}`, f: cf, c: [clng, clat] as [number, number], reach: Math.min(Math.PI, reach) }
})

const marketByIso = new Map<string, Market>()
for (const m of MARKETS) for (const iso of m.iso) marketByIso.set(iso, m)
const MARKET_COUNTRIES = COUNTRIES.filter((c) => marketByIso.has(c.iso))

/** The country each site stands in — its photo fills that country (Poland, Italy, the U.S. …), not the whole market frame */
const ASSET_ISO = new Map(
  ASSETS.map((a) => {
    const c = MARKET_COUNTRIES.find((m) => d3.geoContains(m.f as never, [a.coords[1], a.coords[0]]))
    return [a.id, c ? [c.iso] : null] as const
  }),
)

/** Globe camera: the point facing the viewer, the disc radius and where the disc centre sits */
interface View {
  lat: number
  lng: number
  s: number
  tx: number
  ty: number
}

const multiPoint = (pts: LatLng[]) => ({
  type: 'MultiPoint' as const,
  coordinates: pts.map(([lat, lng]) => [lng, lat]),
})

const globe = (v: View) =>
  d3
    .geoOrthographic()
    .rotate([-v.lng, -v.lat])
    .scale(v.s)
    .translate([v.tx, v.ty])
    .clipAngle(90)
    .precision(0.3)

/** Frame `pts` with the globe turned so `center` faces the viewer */
function fitView(center: LatLng, pts: LatLng[], extent: [[number, number], [number, number]]): View {
  const p = d3
    .geoOrthographic()
    .rotate([-center[1], -center[0]])
    .clipAngle(90)
    .fitExtent(extent, multiPoint(pts) as never)
  const [tx, ty] = p.translate()
  return { lat: center[0], lng: center[1], s: p.scale(), tx, ty }
}

const GLOBE_R = H / 2 - 46
/** Height of the page's bar once it has gone solid (ItiNav) — the map parks just under it on phones */
const NAV_H = 68

/** The whole globe, turned to the Atlantic so the U.S. Gulf Coast and the Arabian Gulf are both in view */
const HOME: View = { lat: 24, lng: -18, s: GLOBE_R, tx: W / 2, ty: H / 2 }
/** Where the globe rests before it turns into HOME the first time the section is seen */
const INTRO: View = { ...HOME, lng: HOME.lng + 70, lat: 12, s: GLOBE_R * 0.82 }

/** Width (SVG units) reserved on the right of a focused frame for the side card */
const CARD_SPACE = 430
const FRAME_PAD = 48

const marketCenter = (m: Market): LatLng => {
  const [lng, lat] = d3.geoCentroid(multiPoint(m.frame) as never)
  return [lat, lng]
}

const frameView = (m: Market, reserveCard: boolean) =>
  fitView(marketCenter(m), m.frame, [
    [FRAME_PAD, FRAME_PAD],
    [W - (reserveCard ? CARD_SPACE : FRAME_PAD), H - FRAME_PAD],
  ])

/** Desktop frames leave room for the side card; on phones the card sits under the map, so the frame has the whole box */
const FRAMES_WIDE = Object.fromEntries(MARKETS.map((m) => [m.id, frameView(m, true)])) as Record<MarketId, View>
const FRAMES_NARROW = Object.fromEntries(MARKETS.map((m) => [m.id, frameView(m, false)])) as Record<MarketId, View>

/**
 * Great-circle turn between two views. Long turns pull back towards the whole
 * globe mid-flight, so Egypt → U.S. never streaks across a zoomed-in surface.
 */
function interpolateView(a: View, b: View) {
  const turn = d3.geoInterpolate([a.lng, a.lat], [b.lng, b.lat])
  const dist = d3.geoDistance([a.lng, a.lat], [b.lng, b.lat])
  const l0 = Math.log(a.s)
  const l1 = Math.log(b.s)
  const ceiling = Math.log(GLOBE_R) + Math.max(0, 1.8 - dist * 1.8)
  const dip = Math.max(0, Math.min(l0, l1) - ceiling)
  const at = (t: number): View => {
    const [lng, lat] = turn(t)
    return {
      lng,
      lat,
      s: Math.exp(l0 + (l1 - l0) * t - dip * Math.sin(Math.PI * t)),
      tx: a.tx + (b.tx - a.tx) * t,
      ty: a.ty + (b.ty - a.ty) * t,
    }
  }
  return { at, duration: 380 + dist * 250 + Math.abs(l1 - l0) * 110 + dip * 90 }
}

/**
 * Camera easing: leaves quickly (the map answers the click at once) and settles softly.
 * A cubic-bezier(0.3, 0, 0.12, 1) solved numerically — no dependency, no per-frame allocation.
 */
function cameraEase(t: number) {
  const x1 = 0.3, y1 = 0, x2 = 0.12, y2 = 1
  const bx = (u: number) => 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3
  const by = (u: number) => 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2
    if (bx(mid) < t) lo = mid
    else hi = mid
  }
  return by((lo + hi) / 2)
}

const HQ: LatLng = [41.39, 2.17]
const CAIRO: LatLng = [30.04, 31.24]

/** Market marker label placement, so neighbouring markets (Egypt / KSA) never collide */
const LABEL_POS: Record<MarketId, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
  egypt: { dx: -14, dy: 4.5, anchor: 'end' },
  saudi: { dx: 14, dy: 4.5, anchor: 'start' },
  usa: { dx: 0, dy: -18, anchor: 'middle' },
  europe: { dx: 0, dy: -18, anchor: 'middle' },
}

/**
 * Sites sharing a city are fanned out around one city point (in SVG units),
 * so three Alexandria or El Minya plants never sit on top of each other.
 */
const CITY_POINT: Record<string, LatLng> = {
  Alexandria: [31.12, 29.88],
  'El Minya': [28.1, 30.75],
  Gdansk: [54.3, 18.68],
}
const PIN_OFFSET: Record<string, [number, number]> = {
  european: [-46, 6],
  ventura: [-16, 22],
  amreyah: [14, 6],
  cimpor: [44, 20],
  'royal-elminya': [0, -24],
  cleopatra: [22, 12],
  cyprometal: [-22, 12],
  'eu-gdansk': [-12, -10],
  'royal-eu': [14, 12],
}

/** City label placement relative to the city point, in SVG units (scaled with the pins) */
const CITY_LABEL_POS: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' }> = {
  Alexandria: { dx: 0, dy: -20, anchor: 'middle' },
  'El Minya': { dx: 36, dy: -16, anchor: 'start' },
  Assiut: { dx: 17, dy: 5, anchor: 'start' },
  Houston: { dx: 0, dy: -19, anchor: 'middle' },
  Tampa: { dx: 0, dy: -19, anchor: 'middle' },
  'Gdańsk': { dx: 0, dy: -30, anchor: 'middle' },
  Ravenna: { dx: 0, dy: -19, anchor: 'middle' },
  Netherlands: { dx: 0, dy: -19, anchor: 'middle' },
}

const CONTEXT_LABELS: { market: MarketId; at: LatLng; name: Record<Lang, string> }[] = [
  { market: 'egypt', at: [32.55, 28.6], name: { en: 'Mediterranean Sea', ar: 'البحر المتوسط' } },
  { market: 'egypt', at: [24.6, 35.9], name: { en: 'Red Sea', ar: 'البحر الأحمر' } },
  { market: 'usa', at: [25.6, -90.5], name: { en: 'Gulf of Mexico', ar: 'خليج المكسيك' } },
  { market: 'usa', at: [31.5, -72.5], name: { en: 'Atlantic Ocean', ar: 'المحيط الأطلسي' } },
  { market: 'europe', at: [55.6, 3.6], name: { en: 'North Sea', ar: 'بحر الشمال' } },
  { market: 'europe', at: [55.9, 15.6], name: { en: 'Baltic Sea', ar: 'بحر البلطيق' } },
  { market: 'europe', at: [43.1, 15.4], name: { en: 'Adriatic Sea', ar: 'البحر الأدرياتيكي' } },
]

function formatCoord(lat: number, lng: number) {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}° ${ns}  ·  ${Math.abs(lng).toFixed(2)}° ${ew}`
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/* ------------------------------------------------------------------ */
/* Earth surface (WebGL, see earthGL.ts)                               */
/* ------------------------------------------------------------------ */

/** Light comes from the upper left, slightly towards the viewer */
const LIGHT = (() => {
  const v = [-0.5, 0.55, 0.68]
  const m = Math.hypot(v[0], v[1], v[2])
  return v.map((x) => x / m) as [number, number, number]
})()

/** The canvas covers the viewBox plus this margin, so a growing globe is not cut at the stage edge */
const CANVAS_PAD_X = 0.16
const CANVAS_PAD_Y = 0.22

/** Zoom disclosure: 0 at the whole globe → 1 at a market frame (log scale, like the camera) */
const zoomLevel = (s: number) => clamp01(Math.log(s / GLOBE_R) / Math.log(2.6))
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/* ------------------------------------------------------------------ */
/* Lifted great-circle arcs                                            */
/* ------------------------------------------------------------------ */

/** A great-circle arc raised off the surface (lift = height at mid-arc, in globe radii) */
function liftedArc(a: LatLng, b: LatLng, v: View, lift: number, steps = 56) {
  const interp = d3.geoInterpolate([a[1], a[0]], [b[1], b[0]])
  const dist = d3.geoDistance([a[1], a[0]], [b[1], b[0]])
  const h = lift * Math.min(1, dist / 1.1)
  const phi0 = v.lat * RAD
  const lam0 = v.lng * RAD
  const sp0 = Math.sin(phi0)
  const cp0 = Math.cos(phi0)
  let d = ''
  let pen = false
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const [lng, lat] = interp(t)
    const phi = lat * RAD
    const dl = lng * RAD - lam0
    const alt = 1 + h * Math.sin(Math.PI * t)
    const x = Math.cos(phi) * Math.sin(dl) * alt
    const y = (cp0 * Math.sin(phi) - sp0 * Math.cos(phi) * Math.cos(dl)) * alt
    const z = (sp0 * Math.sin(phi) + cp0 * Math.cos(phi) * Math.cos(dl)) * alt
    const visible = z > 0 || x * x + y * y > 1
    if (!visible) {
      pen = false
      continue
    }
    const sx = (v.tx + v.s * x).toFixed(1)
    const sy = (v.ty - v.s * y).toFixed(1)
    d += `${pen ? 'L' : 'M'}${sx},${sy}`
    pen = true
  }
  return d
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface Props {
  lang: Lang
}

type Tip = { key: string; x: number; y: number } & (
  | { kind: 'market'; market: Market }
  | { kind: 'asset'; asset: Asset }
  | { kind: 'hq' }
)

const LAND_ZOOM_STROKE = 'rgba(233, 179, 143, 0.28)'
const MARKET_ZOOM = 'rgba(201, 120, 74, 0.14)'

export default function ItiFootprint({ lang }: Props) {
  const t = COPY.footprint
  const uid = useId().replace(/:/g, '')
  const rtl = lang === 'ar'

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const [view, setView] = useState<View>(() => (reduceMotion ? HOME : INTRO))
  const viewRef = useRef<View>(view)
  const [settled, setSettled] = useState(true)
  const [dragging, setDragging] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<{ x: number; y: number; from: View; moved: boolean } | null>(null)
  /** True right after a drag, so the pointer-up does not also count as a click on a country */
  const dragMoved = useRef(false)
  const [focus, setFocus] = useState<MarketId | null>(null)
  const [hovered, setHovered] = useState<MarketId | null>(null)
  const [hoveredAssetId, setHoveredAssetIdRaw] = useState<string | null>(null)
  const [hqHover, setHqHover] = useState(false)
  const [selected, setSelected] = useState<Asset | null>(null)
  const [overview, setOverview] = useState<MarketId | null>(null)
  const [sector, setSector] = useState<SectorId | null>(null)
  const [inView, setInView] = useState(false)
  const touch = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches, [])
  /** On a touch screen a tap fires the mouse and focus events too, and nothing ever "leaves" — so sites are never hovered there */
  const setHoveredAssetId = useCallback((id: string | null) => setHoveredAssetIdRaw(touch ? null : id), [touch])
  const [wide, setWide] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches)
  /** the three-column desktop layout; below it the map sits in the page's flow */
  const [desk, setDesk] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 1024px)').matches)
  /** Marker scale: the map shrinks on small screens, pins and labels must not */
  const [k, setK] = useState(1)
  const [boxW, setBoxW] = useState(0)
  const mapBoxRef = useRef<HTMLDivElement | null>(null)
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const earthRef = useRef<EarthRenderer | null>(null)
  const [glFailed, setGlFailed] = useState(false)
  const texAt = useRef<number | null>(null)
  const coordRef = useRef<HTMLSpanElement | null>(null)
  const introStarted = useRef(false)
  const revealStart = useRef<number | null>(reduceMotion ? -1e9 : null)
  const FRAMES = wide ? FRAMES_WIDE : FRAMES_NARROW

  const animRef = useRef<number>(0)
  const inertiaRef = useRef<number>(0)

  const commit = useCallback((v: View) => {
    viewRef.current = v
    setView(v)
  }, [])

  /* ---------------- camera ---------------- */

  const flyTo = useCallback(
    (target: View, onDone?: () => void) => {
      cancelAnimationFrame(animRef.current)
      const interp = interpolateView(viewRef.current, target)
      cancelAnimationFrame(inertiaRef.current)
      const dur = reduceMotion ? 1 : Math.min(1250, Math.max(520, interp.duration))
      const start = performance.now()
      setSettled(false)

      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        commit(interp.at(cameraEase(p)))
        if (p < 1) {
          animRef.current = requestAnimationFrame(step)
        } else {
          commit(target)
          setSettled(true)
          onDone?.()
        }
      }
      animRef.current = requestAnimationFrame(step)
    },
    [commit, reduceMotion],
  )

  /**
   * Below the desktop layout the map sits in the page's flow, with its details underneath.
   * Whenever it changes what it shows, it is brought back to the top of the screen, just under the bar.
   */
  const scrollToStage = useCallback(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) return
    // the map's own box may be stuck to the top; its column still knows where it belongs
    const col = mapBoxRef.current?.parentElement
    if (!col) return
    const top = Math.round(col.getBoundingClientRect().top + window.scrollY - NAV_H)
    if (Math.abs(top - window.scrollY) < 4) return
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [reduceMotion])

  const startReveal = useCallback(() => {
    introStarted.current = true
    if (revealStart.current == null) revealStart.current = performance.now()
  }, [])

  const focusMarket = useCallback(
    (id: MarketId, then?: () => void) => {
      const m = MARKETS.find((x) => x.id === id)!
      startReveal()
      setSelected(null)
      setOverview(null)
      setFocus(id)
      setHovered(null)
      setHoveredAssetId(null)
      scrollToStage()
      flyTo(FRAMES[id], () => {
        if (m.depth === 'overview') setOverview(id)
        then?.()
      })
    },
    [flyTo, FRAMES, startReveal, scrollToStage, setHoveredAssetId],
  )

  const backToMap = useCallback(() => {
    setSelected(null)
    setOverview(null)
    setFocus(null)
    setHoveredAssetId(null)
    scrollToStage()
    flyTo(HOME)
  }, [flyTo, scrollToStage, setHoveredAssetId])

  useEffect(
    () => () => {
      cancelAnimationFrame(animRef.current)
      cancelAnimationFrame(inertiaRef.current)
    },
    [],
  )

  /* Other sections (Our Businesses) can ask for a site */
  const openAssetById = useCallback(
    (id: string) => {
      const a = ASSETS.find((x) => x.id === id)
      if (!a) return
      setSector(null)
      focusMarket(a.market, () => setSelected(a))
    },
    [focusMarket],
  )
  useEffect(() => {
    const pending = takePendingAsset()
    let timer = 0
    if (pending) {
      introStarted.current = true
      timer = window.setTimeout(() => openAssetById(pending), 450)
    }
    const off = onAssetRequest((id) => {
      introStarted.current = true
      window.clearTimeout(timer)
      timer = window.setTimeout(() => openAssetById(id), 650)
    })
    return () => {
      off()
      window.clearTimeout(timer)
    }
  }, [openAssetById])

  /* The globe turns into place (and the land ripples in from Egypt) the first time the section is seen */
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting)
        if (!e.isIntersecting || introStarted.current) return
        startReveal()
        if (!reduceMotion) flyTo(HOME)
      },
      { threshold: [0, 0.3] },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [flyTo, reduceMotion, startReveal])

  /* Slow idle spin while the whole globe is in view — pauses on hover, drag, zoom, or off-screen */
  useEffect(() => {
    if (focus || dragging || !settled || reduceMotion || hovered || !inView) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!dragRef.current && viewRef.current.s <= GLOBE_R * 1.25) {
        const v = viewRef.current
        commit({ ...v, lng: v.lng + dt * 3.6 })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [focus, dragging, settled, reduceMotion, hovered, inView, commit])

  /* ---------------- responsive frame + marker scale ---------------- */

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const lg = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      setWide(mq.matches)
      setDesk(lg.matches)
    }
    mq.addEventListener('change', onChange)
    lg.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      lg.removeEventListener('change', onChange)
    }
  }, [])

  useEffect(() => {
    const el = mapBoxRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      if (w > 0) {
        setK(Math.min(2.4, Math.max(1.2, 860 / w)))
        setBoxW(w)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // The open market's tab is kept in sight in its strip (moved by hand: scrollIntoView would cut the page's own scroll short)
  useEffect(() => {
    const strip = tabsRef.current
    const tab = strip?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!strip || !tab) return
    const s = strip.getBoundingClientRect()
    const b = tab.getBoundingClientRect()
    strip.scrollBy({ left: b.left - s.left - (s.width - b.width) / 2, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [focus, reduceMotion])

  // Re-frame an open market when crossing the mobile/desktop breakpoint
  useEffect(() => {
    if (focus && settled) commit(FRAMES[focus])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide])

  /* ---------------- derived geometry ---------------- */

  const moving = !settled || dragging
  const projection = useMemo(() => {
    const p = globe(view)
    return moving ? p.precision(1.2) : p
  }, [view, moving])
  const path = useMemo(() => d3.geoPath(projection), [projection])

  /** 1 while the whole globe is in frame, 0 once zoomed in far enough to read as a flat map */
  const round = clamp01((GLOBE_R * 3.2 - view.s) / (GLOBE_R * 2.2))
  /** Globe-scale market washes → map-scale borders as the camera closes in */
  const globeAlpha = clamp01((GLOBE_R * 1.75 - view.s) / (GLOBE_R * 0.75))
  const flatAlpha = 1 - globeAlpha
  /** progressive disclosure while zooming: globe markers out, then cities, seas and pins in */
  const zl = zoomLevel(view.s)
  const globeMarkers = 1 - smoothstep(0.12, 0.42, zl)
  const cityReveal = smoothstep(0.45, 0.8, zl)
  const seaReveal = smoothstep(0.7, 0.98, zl)
  const pinsReady = zl > 0.72

  const revealNow = revealStart.current == null ? 0 : clamp01((performance.now() - revealStart.current) / 1700)
  const texAlpha = texAt.current == null ? 0 : clamp01((performance.now() - texAt.current) / 650)
  const markerReveal = clamp01((revealNow - 0.35) / 0.45)

  /** Only countries that can be on screen are projected */
  const visibleCountries = useMemo(() => {
    const center: [number, number] = [view.lng, view.lat]
    const list = flatAlpha > 0 ? COUNTRIES : MARKET_COUNTRIES
    return list
      .filter((c) => d3.geoDistance(center, c.c) - c.reach < Math.PI / 2)
      .map((c) => ({ iso: c.iso, d: path(c.f as never) ?? '' }))
      .filter((c) => c.d)
  }, [path, view.lng, view.lat, flatAlpha])

  const sphereD = useMemo(() => path({ type: 'Sphere' } as never) ?? '', [path])

  const project = (lat: number, lng: number) => projection([lng, lat]) as [number, number]
  /** 0 on or behind the horizon → 1 well on the near side, so markers fade as the globe turns them away */
  const limb = (lat: number, lng: number) =>
    Math.max(0, Math.min(1, (Math.PI / 2 - d3.geoDistance([lng, lat], [view.lng, view.lat]) - 0.06) / 0.22))

  const focusMarketObj = focus ? MARKETS.find((m) => m.id === focus)! : null
  const hoveredMarket = hovered ? MARKETS.find((m) => m.id === hovered)! : null
  const plantsMode = focusMarketObj?.depth === 'plants' && settled
  /** pins and city labels arrive during the flight, not after it */
  const plantsVisible = focusMarketObj?.depth === 'plants' && pinsReady
  /** export lanes stay on for the overview globe; HQ links still appear in context on hover */
  const showLanes = !focus
  const hqRouteFor = (id: MarketId) => !focus && (hqHover || hovered === id)
  const hoveredAsset = hoveredAssetId ? ASSETS.find((a) => a.id === hoveredAssetId) ?? null : null

  useEffect(() => {
    if (selected && sector != null && selected.sector !== sector) setSelected(null)
  }, [sector, selected])

  /* ---------------- canvas: the Earth (WebGL) ---------------- */

  const [, forceTick] = useState(0)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    let alive = true
    let r: EarthRenderer | null = null
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const lite = conn?.saveData || /2g/.test(conn?.effectiveType ?? '')

    const load = (target: EarthRenderer, w: number) =>
      new Promise<void>((done) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = `/iti/earth/earth-${w}.webp`
        img
          .decode()
          .then(() => {
            if (!alive || earthRef.current !== target) return
            target.setTexture(img, w)
            if (texAt.current == null) texAt.current = performance.now()
            forceTick((n) => n + 1)
          })
          .catch(() => undefined)
          .finally(done)
      })

    const boot = () => {
      r = createEarthRenderer(c, LIGHT, CAIRO)
      earthRef.current = r
      if (!r) {
        setGlFailed(true)
        return
      }
      setGlFailed(false)
      const target = r
      // 2K paints first; the 4K surface follows when the screen and the GPU can use it
      void load(target, 2048).then(() => {
        if (!alive || earthRef.current !== target || lite || target.maxTexture < 4096 || !window.matchMedia('(min-width: 768px)').matches) return
        const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 500))
        idle(() => void load(target, 4096))
      })
      forceTick((n) => n + 1)
    }

    // a lost GPU context (driver reset, tab in background on mobile) is rebuilt, not abandoned
    const onLost = (e: Event) => {
      e.preventDefault()
      earthRef.current = null
      r = null
    }
    const onRestored = () => alive && boot()
    c.addEventListener('webglcontextlost', onLost)
    c.addEventListener('webglcontextrestored', onRestored)
    boot()
    return () => {
      alive = false
      c.removeEventListener('webglcontextlost', onLost)
      c.removeEventListener('webglcontextrestored', onRestored)
      r?.dispose()
      earthRef.current = null
    }
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    const r = earthRef.current
    if (!c || !r || boxW === 0) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const cssW = boxW * (1 + CANVAS_PAD_X * 2)
    const cssH = ((boxW * H) / W) * (1 + CANVAS_PAD_Y * 2)
    const pxW = Math.round(cssW * dpr)
    const pxH = Math.round(cssH * dpr)
    if (c.width !== pxW || c.height !== pxH) {
      c.width = pxW
      c.height = pxH
    }
    r.draw({
      view,
      unit: (boxW / W) * dpr,
      padX: W * CANVAS_PAD_X,
      padY: H * CANVAS_PAD_Y,
      reveal: revealNow,
      round,
      texAlpha,
    })
  })

  /* keep painting until the intro and the texture fade have finished, even if the camera is still */
  useEffect(() => {
    if ((revealStart.current == null || revealNow >= 1) && (texAt.current == null || texAlpha >= 1)) return
    const raf = requestAnimationFrame(() => forceTick((n) => n + 1))
    return () => cancelAnimationFrame(raf)
  })

  /**
   * Photos only after a market is open — the overview globe must look complete on its own.
   * Site photos render naturally (no duotone / color wash) so the plant reads as itself.
   */
  const overviewMarket = overview ? MARKETS.find((m) => m.id === overview)! : null

  /**
   * The photo of what the visitor is looking at, clipped to its country in the brand duotone:
   * a hovered or open site in a plants market, or the market itself while its overview card is open (KSA).
   */
  const photo = useMemo(() => {
    if (!focusMarketObj || !settled) return null
    if (plantsMode) {
      const asset = hoveredAsset ?? selected
      if (!asset) return null
      const market = MARKETS.find((m) => m.id === asset.market)!
      return { isos: ASSET_ISO.get(asset.id) ?? market.iso, href: photoUrl(asset.photo, 1600) }
    }
    if (overviewMarket) return { isos: overviewMarket.iso, href: photoUrl(overviewMarket.photo, 1600) }
    return null
  }, [focusMarketObj, settled, plantsMode, hoveredAsset, selected, overviewMarket])

  const photoIsos = photo ? photo.isos : []
  /** the photo covers the on-screen part of its countries, so it always reads at full size */
  const photoBounds = useMemo(() => {
    if (!photo) return null
    let x0 = Infinity
    let y0 = Infinity
    let x1 = -Infinity
    let y1 = -Infinity
    for (const c of MARKET_COUNTRIES) {
      if (!photo.isos.includes(c.iso)) continue
      const b = path.bounds(c.f as never)
      if (!Number.isFinite(b[0][0])) continue
      x0 = Math.min(x0, b[0][0])
      y0 = Math.min(y0, b[0][1])
      x1 = Math.max(x1, b[1][0])
      y1 = Math.max(y1, b[1][1])
    }
    x0 = Math.max(x0, 0)
    y0 = Math.max(y0, 0)
    x1 = Math.min(x1, W)
    y1 = Math.min(y1, H)
    if (!(x1 - x0 > 4 && y1 - y0 > 4)) return null
    return [
      [x0, y0],
      [x1, y1],
    ] as [[number, number], [number, number]]
  }, [photo, path])

  const assetsInFocus = plantsVisible ? ASSETS.filter((a) => a.market === focus) : []
  const pins = assetsInFocus.map((a) => {
    const hub = a.hub ? CITY_POINT[a.hub] : undefined
    const off = PIN_OFFSET[a.id]
    const p = hub && off ? project(hub[0], hub[1]) : project(a.coords[0], a.coords[1])
    return { asset: a, x: p[0] + (hub && off ? off[0] * k : 0), y: p[1] + (hub && off ? off[1] * k : 0) }
  })

  /** Leader line from the open site (or market) to the side card's edge — desktop only, mirrors SideCard's geometry */
  const leader = (() => {
    if (!wide || !settled || boxW === 0) return null
    let src: [number, number] | null = null
    let key = ''
    if (selected && plantsMode) {
      const pin = pins.find((p) => p.asset.id === selected.id)
      if (pin) {
        src = [pin.x, pin.y]
        key = selected.id
      }
    } else if (overviewMarket) {
      src = project(overviewMarket.anchor[0], overviewMarket.anchor[1])
      key = overviewMarket.id
    }
    if (!src) return null
    const cardLeft = W * 0.975 - Math.min(420, 0.44 * boxW) * (W / boxW)
    if (cardLeft < src[0] + 30) return null
    const ty = Math.min(H * 0.66, Math.max(H * 0.34, src[1]))
    const mx = src[0] + (cardLeft - src[0]) * 0.55
    return { key, sx: src[0], sy: src[1], ex: cardLeft, ey: ty, d: `M${src[0]},${src[1]} C${mx},${src[1]} ${mx},${ty} ${cardLeft},${ty}` }
  })()

  const tip: Tip | null = (() => {
    if (dragging) return null
    if (plantsMode && hoveredAsset && hoveredAsset.id !== selected?.id) {
      const pin = pins.find((p) => p.asset.id === hoveredAsset.id)
      if (pin) return { key: hoveredAsset.id, kind: 'asset', asset: hoveredAsset, x: pin.x, y: pin.y }
    }
    if (hoveredMarket && hoveredMarket.id !== focus && settled) {
      const p = project(hoveredMarket.anchor[0], hoveredMarket.anchor[1])
      if (limb(hoveredMarket.anchor[0], hoveredMarket.anchor[1]) > 0.3)
        return { key: hoveredMarket.id, kind: 'market', market: hoveredMarket, x: p[0], y: p[1] }
    }
    if (hqHover && !focus && limb(HQ[0], HQ[1]) > 0) {
      const p = project(HQ[0], HQ[1])
      return { key: 'hq', kind: 'hq', x: p[0], y: p[1] }
    }
    return null
  })()

  /* ---------------- interactions ---------------- */

  function onCountryClick(iso: string) {
    if (dragMoved.current) return
    const m = marketByIso.get(iso)
    if (!m) {
      if (selected) setSelected(null)
      return
    }
    if (focus === m.id) {
      if (m.depth === 'overview') setOverview(m.id)
      return
    }
    focusMarket(m.id)
  }

  function openAsset(a: Asset) {
    if (selected?.id !== a.id) scrollToStage()
    setSelected((cur) => (cur?.id === a.id ? null : a))
  }

  const stepAsset = useCallback((dir: 1 | -1) => {
    setSelected((cur) => {
      if (!cur) return cur
      const list = ASSETS.filter((a) => a.market === cur.market)
      const i = list.findIndex((a) => a.id === cur.id)
      return list[(i + dir + list.length) % list.length]
    })
  }, [])

  /** Drag turns the globe while no market is open; listeners sit on window so country clicks still land */
  function onMapPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    dragMoved.current = false
    if (focus || e.button !== 0) return
    cancelAnimationFrame(inertiaRef.current)
    const unit = W / e.currentTarget.getBoundingClientRect().width
    dragRef.current = { x: e.clientX, y: e.clientY, from: viewRef.current, moved: false }
    /** recent pointer samples, for the release velocity */
    const trail: { t: number; lng: number; lat: number }[] = []

    const move = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      if (!d.moved) {
        if (Math.hypot(ev.clientX - d.x, ev.clientY - d.y) * unit < 6) return
        cancelAnimationFrame(animRef.current)
        Object.assign(d, { x: ev.clientX, y: ev.clientY, from: viewRef.current, moved: true })
        setSettled(true)
        setDragging(true)
        setHovered(null)
        setHqHover(false)
        return
      }
      const deg = 180 / Math.PI / d.from.s
      const next = {
        ...d.from,
        lng: d.from.lng - (ev.clientX - d.x) * unit * deg,
        lat: Math.max(-50, Math.min(65, d.from.lat + (ev.clientY - d.y) * unit * deg)),
      }
      commit(next)
      const now = performance.now()
      trail.push({ t: now, lng: next.lng, lat: next.lat })
      while (trail.length > 2 && now - trail[0].t > 90) trail.shift()
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      dragMoved.current = dragRef.current?.moved ?? false
      dragRef.current = null
      setDragging(false)
      // momentum: keep turning with the release velocity, easing out exponentially
      if (reduceMotion || trail.length < 2 || !dragMoved.current) return
      const a = trail[0]
      const b = trail[trail.length - 1]
      const dt = Math.max(16, b.t - a.t)
      let vLng = (b.lng - a.lng) / dt
      let vLat = (b.lat - a.lat) / dt
      if (performance.now() - b.t > 80) return
      let last = performance.now()
      const glide = (now: number) => {
        const step = Math.min(40, now - last)
        last = now
        const decay = Math.exp(-step / 260)
        vLng *= decay
        vLat *= decay
        const v = viewRef.current
        commit({ ...v, lng: v.lng + vLng * step, lat: Math.max(-50, Math.min(65, v.lat + vLat * step)) })
        if (Math.hypot(vLng, vLat) > 0.0015) inertiaRef.current = requestAnimationFrame(glide)
      }
      inertiaRef.current = requestAnimationFrame(glide)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  function onMapPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const el = coordRef.current
    if (!el) return
    const r = e.currentTarget.getBoundingClientRect()
    const ll = projection.invert?.([((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H])
    if (ll && Number.isFinite(ll[0])) el.textContent = formatCoord(ll[1], ll[0])
  }

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    if (!focus && !selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selected) setSelected(null)
        else if (overview) setOverview(null)
        else backToMap()
      } else if (selected && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault()
        stepAsset(e.key === 'ArrowRight' ? 1 : -1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus, selected, overview, backToMap, stepAsset])

  const marketCounts = (m: Market) => {
    if (m.depth === 'plants') {
      const n = ASSETS.filter((a) => a.market === m.id).length
      return `${n} ${t.sites[lang]}`
    }
    return `2 ${t.plants[lang]}`
  }

  const selectedSiblings = selected ? ASSETS.filter((a) => a.market === selected.market) : []
  /** Below the desktop layout the map is a window while it is zoomed (or still flying): it never spills over the text around it */
  const framed = !desk && (focus != null || view.s > GLOBE_R * 1.04)

  /** The open market in words: its figure, what it is, and (for a market with pins) its sites as a list */
  const marketBrief = (m: Market, docked: boolean) => {
    const sites = ASSETS.filter((a) => a.market === m.id && (sector == null || a.sector === sector))
    return (
      <>
        <div className={docked ? 'flex items-end justify-between gap-4' : undefined}>
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-[var(--iti-copper-soft)]">{m.name[lang]}</p>
            <p className={`mt-2 font-[family-name:var(--iti-head)] font-extrabold tracking-tight tabular-nums ${docked ? 'text-[1.85rem] leading-none' : 'text-[2rem] leading-tight'}`} dir="ltr">
              <MoneyCount value={m.investment} />
            </p>
          </div>
          <p className={`text-xs tracking-wide text-[var(--iti-fp-soft)] ${docked ? 'pb-0.5 text-end' : ''}`}>{t.investment[lang]}</p>
        </div>
        <p className="mt-4 text-sm font-semibold leading-snug">{m.headline[lang]}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--iti-fp-soft)]">{m.summary[lang]}</p>
        {m.points && (m.depth === 'plants' || docked) && (
          <ul className="mt-3 space-y-1.5">
            {m.points.map((p) => (
              <li key={p.en} className="flex gap-2 text-[0.76rem] leading-snug text-[var(--iti-fp-soft)]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--iti-copper-soft)]" aria-hidden />
                {p[lang]}
              </li>
            ))}
          </ul>
        )}

        {m.depth === 'plants' && (
          <div className="mt-6">
            <p className="iti-panel-label mb-2">
              {t.sitesList[lang]}
              <span className="iti-panel-count" dir="ltr">
                {sites.length}
              </span>
            </p>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {sites.map((a) => {
                const on = selected?.id === a.id
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => openAsset(a)}
                      onMouseEnter={() => setHoveredAssetId(a.id)}
                      onMouseLeave={() => setHoveredAssetId(null)}
                      onFocus={() => setHoveredAssetId(a.id)}
                      onBlur={() => setHoveredAssetId(null)}
                      aria-pressed={on}
                      className={`group flex w-full items-center gap-3 text-start transition ${docked ? 'py-3.5' : 'py-2.5'} ${
                        on ? 'text-white' : 'text-[var(--iti-fp-soft)] hover:text-white'
                      }`}
                    >
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full ring-2 ring-white/80 ${
                          a.status === 'construction' ? 'outline-1 outline-offset-2 outline-dashed outline-white/70' : ''
                        }`}
                        style={{ background: SECTORS[a.sector].color }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate font-semibold text-white ${docked ? 'text-[0.92rem]' : 'text-[0.82rem]'}`}>
                          {a.name}
                          {a.parent && a.market !== 'egypt' ? ` · ${a.parent}` : ''}
                        </span>
                        <span className={`block ${docked ? 'text-xs' : 'text-[0.7rem]'}`}>{a.city[lang]}</span>
                      </span>
                      <span
                        aria-hidden
                        className={`text-xs text-[var(--iti-copper-soft)] transition ${
                          on || docked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        } ${rtl ? 'rotate-180' : ''}`}
                      >
                        →
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {!docked && <p className="mt-3 text-xs font-medium text-[var(--iti-copper-soft)]">{t.hintPlants[lang]}</p>}
          </div>
        )}
      </>
    )
  }

  /* ---------------- render ---------------- */

  return (
    <section ref={sectionRef} className="iti-footprint relative text-white" aria-labelledby={`${uid}-title`}>
      <div className="iti-footprint-bg" aria-hidden />
      <div className="relative mx-auto grid max-w-[1600px] lg:h-[100svh] lg:min-h-[640px] lg:grid-cols-12">
        {/* ---------- LEFT: narrative ---------- */}
        <aside className="iti-map-panel iti-panel-scroll relative z-10 flex flex-col px-5 pt-20 pb-6 sm:px-8 lg:col-span-3 lg:overflow-y-auto lg:border-e lg:pt-[116px] lg:pb-10">
          <p className="iti-eyebrow iti-eyebrow-light">{t.eyebrow[lang]}</p>
          <h2 id={`${uid}-title`} className="iti-h2 iti-h2-light iti-map-title mt-5">
            {t.title[lang]}
          </h2>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-[var(--iti-fp-soft)]">{t.body[lang]}</p>

          {/* desktop: the open market is told here, beside the globe */}
          <div className="mt-10 hidden min-h-[220px] lg:block">
            <AnimatePresence mode="wait">
              {focusMarketObj ? (
                <motion.div
                  key={focusMarketObj.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="border-t-2 border-[var(--iti-copper)] pt-5"
                >
                  {marketBrief(focusMarketObj, false)}
                </motion.div>
              ) : (
                <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="flex items-center gap-3 text-xs font-medium tracking-wide text-[var(--iti-copper-soft)]">
                    <span className="iti-pulse-dot" aria-hidden />
                    {touch ? t.hintTouch[lang] : t.hint[lang]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* phones and tablets: only the prompt lives here — the open market is told under the map, so the map never jumps */}
          <p
            className={`mt-7 flex items-center gap-3 text-xs font-medium tracking-wide text-[var(--iti-copper-soft)] transition-opacity duration-300 lg:hidden ${
              focus ? 'opacity-0' : ''
            }`}
            aria-hidden={focus ? true : undefined}
          >
            <span className="iti-pulse-dot" aria-hidden />
            {touch ? t.hintTouch[lang] : t.hint[lang]}
          </p>
        </aside>

        {/* ---------- CENTER: globe ---------- */}
        <div className="relative flex flex-col justify-center pb-6 md:px-4 lg:col-span-6 lg:min-h-0 lg:pt-[84px] lg:pb-6">
          <div
            ref={mapBoxRef}
            className={`iti-globe-stage relative mx-auto w-[min(100%,calc((100svh_-_96px)*1.163))] max-w-[980px] lg:w-[min(100%,calc((100svh_-_150px)*1.163))] ${focus ? 'is-zoomed' : ''} ${
              framed ? 'is-framed' : ''
            }`}
            style={{ aspectRatio: `${W} / ${H}` }}
          >
            <AnimatePresence>
              {focus && (
                <motion.button
                  type="button"
                  key="back"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onClick={backToMap}
                  className="absolute bottom-2 left-2 z-30 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[rgba(3,30,48,0.7)] px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition hover:border-white/60 md:top-3 md:bottom-auto md:left-3"
                >
                  <span aria-hidden className={rtl ? 'rotate-180' : ''}>
                    ←
                  </span>
                  {t.back[lang]}
                </motion.button>
              )}
            </AnimatePresence>

            {/* ---------- back layer: atmosphere, ocean, graticule ---------- */}
            <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              <defs>
                <radialGradient id={`${uid}-ocean`} cx="34%" cy="28%" r="78%">
                  <stop offset="0" stopColor="#1f6288" />
                  <stop offset="0.42" stopColor="#0c4363" />
                  <stop offset="0.78" stopColor="#062c45" />
                  <stop offset="1" stopColor="#031c2e" />
                </radialGradient>
                <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="2.2" />
                </filter>
              </defs>

              {/* the Earth is shaded in WebGL; without it the globe keeps a quiet ocean disc */}
              {glFailed && <path d={sphereD} fill={`url(#${uid}-ocean)`} />}
            </svg>

            {/* ---------- the Earth ---------- */}
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute"
              style={{
                left: `${-CANVAS_PAD_X * 100}%`,
                top: `${-CANVAS_PAD_Y * 100}%`,
                width: `${100 + CANVAS_PAD_X * 200}%`,
                height: `${100 + CANVAS_PAD_Y * 200}%`,
              }}
              aria-hidden
            />

            {/* ---------- front layer: countries, network, markers, pins ---------- */}
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className={`absolute inset-0 h-full w-full overflow-visible select-none ${focus ? '' : dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              role="img"
              aria-label={t.mapLabel[lang]}
              style={{ direction: 'ltr', touchAction: focus ? 'auto' : 'pan-y' }}
              onPointerDown={onMapPointerDown}
              onPointerMove={onMapPointerMove}
              onPointerLeave={() => {
                setHovered(null)
                setHoveredAssetId(null)
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !dragMoved.current && selected) setSelected(null)
              }}
            >
              {/* invisible sphere: clicks on open ocean close the card */}
              <path d={sphereD} fill="transparent" onClick={() => !dragMoved.current && selected && setSelected(null)} />

              {/* countries — markets only on the globe, every country once zoomed */}
              {visibleCountries.map(({ iso, d }) => {
                const m = marketByIso.get(iso)
                const isFocus = m != null && m.id === focus
                const isPhoto = photoIsos.includes(iso)
                const isHot = m != null && hovered === m.id && m.id !== focus
                const building = m?.isoUnderConstruction?.includes(iso)

                if (!m) {
                  return (
                    <path
                      key={iso}
                      d={d}
                      fill="transparent"
                      stroke={LAND_ZOOM_STROKE}
                      strokeOpacity={flatAlpha}
                      strokeWidth={0.6}
                      strokeLinejoin="round"
                      onClick={() => onCountryClick(iso)}
                    />
                  )
                }

                // a market: a faint copper wash on the globe; a hairline border with a whisper of tint when zoomed
                const globeFill = isHot ? 'rgba(227,154,107,0.26)' : 'rgba(201,120,74,0.1)'
                const zoomFill = isPhoto ? 'transparent' : isFocus ? 'rgba(239,201,164,0.05)' : MARKET_ZOOM
                return (
                  <g key={iso} className="cursor-pointer">
                    <path
                      d={d}
                      fill={globeFill}
                      opacity={globeAlpha}
                      stroke={isHot ? '#ffcfae' : '#e39a6b'}
                      strokeOpacity={isHot ? 0.9 : 0.42}
                      strokeWidth={isHot ? 1.2 : 0.6}
                      strokeDasharray={building ? '4 3' : undefined}
                      strokeLinejoin="round"
                      className="transition-[fill] duration-300"
                      onMouseEnter={() => m.id !== focus && !dragRef.current?.moved && setHovered(m.id)}
                      onMouseLeave={() => setHovered((cur) => (cur === m.id ? null : cur))}
                      onClick={() => onCountryClick(iso)}
                    />
                    {flatAlpha > 0 && (
                      <path
                        d={d}
                        fill={zoomFill}
                        opacity={flatAlpha}
                        stroke={isPhoto || isFocus ? '#e9b38f' : 'rgba(233,179,143,0.5)'}
                        strokeWidth={isPhoto || isFocus ? 1.3 : 0.8}
                        strokeDasharray={building ? '4 3' : undefined}
                        strokeLinejoin="round"
                        onClick={() => onCountryClick(iso)}
                      />
                    )}
                  </g>
                )
              })}

              {/* the open market's photo, clipped to its borders — natural colour, no tint */}
              {photo && photoBounds && photoIsos.length > 0 && (
                <g pointerEvents="none">
                  <defs>
                    <clipPath id={`${uid}-clip`}>
                      {visibleCountries
                        .filter((c) => photoIsos.includes(c.iso))
                        .map((c) => (
                          <path key={c.iso} d={c.d} />
                        ))}
                    </clipPath>
                  </defs>
                  <image
                    key={photo.href}
                    className="iti-photo-in"
                    href={photo.href}
                    x={photoBounds[0][0]}
                    y={photoBounds[0][1]}
                    width={Math.max(1, photoBounds[1][0] - photoBounds[0][0])}
                    height={Math.max(1, photoBounds[1][1] - photoBounds[0][1])}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${uid}-clip)`}
                  />
                  {visibleCountries
                    .filter((c) => photoIsos.includes(c.iso))
                    .map((c) => (
                      <path key={`edge-${c.iso}`} d={c.d} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.4} strokeLinejoin="round" />
                    ))}
                </g>
              )}

              {/* hairline limb — the shader carries the light and the atmosphere */}
              {round > 0 && <path d={sphereD} fill="none" stroke="#bfe0f2" strokeOpacity={0.16 * round} strokeWidth={0.6} pointerEvents="none" />}

              {/* head-office links from Barcelona */}
              {!focus &&
                MARKETS.map((m) => {
                  if (!hqRouteFor(m.id)) return null
                  const d = path({
                    type: 'LineString',
                    coordinates: [
                      [HQ[1], HQ[0]],
                      [m.anchor[1], m.anchor[0]],
                    ],
                  } as never)
                  if (!d) return null
                  const on = hovered === m.id
                  return (
                    <motion.g
                      key={`route-${m.id}`}
                      pointerEvents="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: markerReveal * globeMarkers }}
                      transition={{ duration: 0.25 }}
                    >
                      <path
                        d={d}
                        fill="none"
                        stroke="#9fc3d8"
                        strokeOpacity={0.5}
                        strokeWidth={0.8 * k}
                        strokeDasharray="2 5"
                        strokeLinecap="round"
                      />
                      {settled && <RouteTrace d={d} k={k} reduceMotion={reduceMotion} strong={on} />}
                    </motion.g>
                  )
                })}

              {/* export & distribution lanes from Alexandria — lifted arcs with travelling light */}
              <AnimatePresence>
              {showLanes && markerReveal > 0 && (
                <motion.g
                  key="lanes"
                  pointerEvents="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: markerReveal * globeMarkers }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {LANES.map((lane, i) => {
                    const d = liftedArc(LANE_ORIGIN, lane.to, view, 0.16)
                    if (!d) return null
                    return (
                      <g key={lane.id}>
                        <path d={d} fill="none" stroke="#c9784a" strokeOpacity={0.14} strokeWidth={3 * k} filter={`url(#${uid}-soft)`} />
                        <path d={d} fill="none" stroke="#d9895a" strokeOpacity={0.7} strokeWidth={0.8 * k} strokeLinecap="round" />
                        {!reduceMotion && (
                          <path
                            d={d}
                            pathLength={1}
                            fill="none"
                            stroke="#ffe2cc"
                            strokeWidth={1.6 * k}
                            strokeLinecap="round"
                            className="iti-comet"
                            style={{ animationDelay: `${(i * 0.53) % 3.2}s` }}
                          />
                        )}
                      </g>
                    )
                  })}
                  {LANES.map((lane) => {
                    const facing = limb(lane.to[0], lane.to[1])
                    if (facing === 0) return null
                    const p = project(lane.to[0], lane.to[1])
                    return (
                      <g key={`end-${lane.id}`} transform={`translate(${p[0]} ${p[1]}) scale(${k})`} opacity={facing}>
                        <circle r={1.9} fill="#ffe2cc" />
                        {lane.label && (
                          <text x={7} y={3.5} className="iti-map-label iti-map-label-soft" fontSize={9.5} fontWeight={600}>
                            {lane.label[lang]}
                          </text>
                        )}
                      </g>
                    )
                  })}
                  {(() => {
                    const facing = limb(LANE_ORIGIN[0], LANE_ORIGIN[1])
                    if (facing === 0) return null
                    const p = project(LANE_ORIGIN[0], LANE_ORIGIN[1])
                    return <circle cx={p[0]} cy={p[1]} r={2.2 * k} fill="#ffe2cc" opacity={facing} />
                  })()}
                </motion.g>
              )}
              </AnimatePresence>

              {/* head office */}
              {!focus &&
                limb(HQ[0], HQ[1]) > 0 &&
                (() => {
                  const p = project(HQ[0], HQ[1])
                  return (
                    <g
                      transform={`translate(${p[0]} ${p[1]}) scale(${k})`}
                      opacity={limb(HQ[0], HQ[1]) * markerReveal * globeMarkers}
                      className="cursor-default"
                      onMouseEnter={() => setHqHover(true)}
                      onMouseLeave={() => setHqHover(false)}
                    >
                      <circle r={16} fill="transparent" />
                      <rect
                        x={-3.6}
                        y={-3.6}
                        width={7.2}
                        height={7.2}
                        transform={`rotate(45) scale(${hqHover ? 1.25 : 1})`}
                        fill="#ffffff"
                        stroke="#053552"
                        strokeWidth={1.5}
                      />
                      <text x={-10} y={3.5} textAnchor="end" className="iti-city-label" style={{ fontSize: 9, strokeWidth: 3 }}>
                        {t.hq[lang]}
                      </text>
                    </g>
                  )
                })()}

              {/* market markers — they hand over to cities and sites as the camera closes in */}
              {globeMarkers > 0.01 &&
                MARKETS.map((m) => {
                  const facing = limb(m.anchor[0], m.anchor[1])
                  if (facing === 0) return null
                  const live = !focus
                  const p = project(m.anchor[0], m.anchor[1])
                  const active = hovered === m.id
                  return (
                    <g
                      key={m.id}
                      transform={`translate(${p[0]} ${p[1]})`}
                      opacity={facing * markerReveal * globeMarkers}
                      className={live ? 'cursor-pointer' : undefined}
                      pointerEvents={live ? undefined : 'none'}
                      role="button"
                      tabIndex={live ? 0 : -1}
                      aria-hidden={live ? undefined : true}
                      aria-label={m.name[lang]}
                      onMouseEnter={() => !dragRef.current?.moved && setHovered(m.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(m.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => !dragMoved.current && focusMarket(m.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          focusMarket(m.id)
                        }
                      }}
                    >
                      <g transform={`scale(${k})`}>
                        <circle r={20} fill="transparent" />
                        {active && <circle r={12} fill="#e39a6b" opacity={0.22} className="iti-ping" />}
                        <circle r={7.5} fill="#e39a6b" opacity={active ? 0.26 : 0.12} />
                        <circle className="iti-pin-core" r={active ? 5.2 : 4.4} fill="#c9784a" stroke="#fff" strokeWidth={1.6} />
                        <g transform={`translate(${LABEL_POS[m.id].dx * 0.82} ${LABEL_POS[m.id].dy * 0.82})`}>
                          <text textAnchor={LABEL_POS[m.id].anchor} className="iti-map-label" fontSize={active ? 13 : 11.5} fontWeight={700}>
                            {(m.mapName ?? m.name)[lang]}
                          </text>
                        </g>
                      </g>
                    </g>
                  )
                })}

              {/* zoomed: sea + city labels */}
              {plantsVisible &&
                seaReveal > 0 &&
                CONTEXT_LABELS.filter((c) => c.market === focus).map((c) => {
                  const p = project(c.at[0], c.at[1])
                  return (
                    <text key={c.name.en} x={p[0]} y={p[1]} textAnchor="middle" className="iti-sea-label" opacity={seaReveal} style={{ fontSize: 12 * k }}>
                      {c.name[lang]}
                    </text>
                  )
                })}
              {focusMarketObj?.depth === 'plants' &&
                cityReveal > 0 &&
                CITY_LABELS.filter((c) => c.market === focus).map((c) => {
                  const p = project(c.at[0], c.at[1])
                  const pos = CITY_LABEL_POS[c.name.en] ?? { dx: 0, dy: -19, anchor: 'middle' as const }
                  return (
                    <text
                      key={c.name.en}
                      x={p[0] + pos.dx * k * 0.9}
                      y={p[1] + pos.dy * k * 0.9}
                      textAnchor={pos.anchor}
                      className="iti-city-label"
                      opacity={cityReveal}
                      style={{ fontSize: 11.5 * k, strokeWidth: 3.5 * k }}
                      pointerEvents="none"
                    >
                      {c.name[lang]}
                    </text>
                  )
                })}

              {/* leader line to the open card */}
              <AnimatePresence>
                {leader && (
                  <motion.g key={`leader-${leader.key}`} pointerEvents="none" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                    <motion.path
                      d={leader.d}
                      fill="none"
                      stroke="#e39a6b"
                      strokeWidth={1.4 * k}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.05, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <motion.circle
                      cx={leader.ex}
                      cy={leader.ey}
                      r={3.2 * k}
                      fill="#e39a6b"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: reduceMotion ? 0 : 0.42 }}
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                  </motion.g>
                )}
              </AnimatePresence>

              {/* zoomed: site pins — coloured by sector; filtered pins are hidden */}
              {pins
                .filter(({ asset }) => sector == null || asset.sector === sector)
                .map(({ asset, x, y }, i) => {
                const color = SECTORS[asset.sector].color
                const isSel = selected?.id === asset.id
                const isHover = hoveredAssetId === asset.id
                return (
                  <motion.g
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: isHover && !isSel ? 1.18 : 1 }}
                    transition={{ delay: isHover ? 0 : 0.04 + i * 0.045, type: 'spring', stiffness: 420, damping: 22 }}
                    style={{ x, y, cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${asset.name}, ${asset.city[lang]}`}
                    aria-pressed={isSel}
                    onMouseEnter={() => setHoveredAssetId(asset.id)}
                    onMouseLeave={() => setHoveredAssetId(null)}
                    onFocus={() => setHoveredAssetId(asset.id)}
                    onBlur={() => setHoveredAssetId(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      openAsset(asset)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openAsset(asset)
                      }
                    }}
                  >
                    <g transform={`scale(${k})`}>
                      <circle r={16} fill="transparent" />
                      {(isSel || isHover) && <circle r={13} fill={color} opacity={0.28} className="iti-ping" />}
                      {isSel && <circle r={13} fill="none" stroke={color} strokeWidth={1.8} />}
                      {asset.status === 'construction' && <circle r={10.5} fill="none" stroke="#ffffff" strokeWidth={1.2} strokeDasharray="2 2" />}
                      <circle r={8.2} fill={color} stroke="#ffffff" strokeWidth={2} className="iti-pin-core" />
                      <circle r={isSel ? 3.2 : 2.6} fill="#ffffff" opacity={0.95} />
                    </g>
                  </motion.g>
                )
              })}
            </svg>

            {/* ---------- hover tooltip ---------- */}
            <AnimatePresence>
              {tip && (
                <div
                  key={tip.key}
                  className="pointer-events-none absolute z-20"
                  style={{
                    left: `${Math.min(88, Math.max(12, (tip.x / W) * 100))}%`,
                    top: `${(tip.y / H) * 100}%`,
                    transform: tip.y < H * 0.3 ? 'translate(-50%, 26px)' : 'translate(-50%, calc(-100% - 26px))',
                  }}
                >
                  <motion.div
                    dir={rtl ? 'rtl' : 'ltr'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.16 }}
                    className="w-max max-w-[240px] rounded-xl bg-white px-3.5 py-2.5 text-[var(--iti-navy)] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.6)] ring-1 ring-black/5"
                  >
                    {tip.kind === 'hq' ? (
                      <>
                        <p className="text-[0.62rem] font-semibold tracking-[0.16em] uppercase text-[var(--iti-steel)]">{t.hqRole[lang]}</p>
                        <p className="mt-0.5 font-[family-name:var(--iti-head)] text-[0.95rem] font-bold">{t.hq[lang]}</p>
                      </>
                    ) : tip.kind === 'market' ? (
                      <>
                        <p className="text-[0.62rem] font-semibold tracking-[0.16em] uppercase text-[var(--iti-steel)]">{marketCounts(tip.market)}</p>
                        <p className="mt-0.5 flex items-baseline gap-3 font-[family-name:var(--iti-head)] text-[0.95rem] font-bold">
                          {tip.market.name[lang]}
                          <span className="text-[var(--iti-copper)]">{tip.market.investment}</span>
                        </p>
                        <p className="mt-1 text-[0.68rem] text-[var(--iti-ink-soft)]">
                          {t.clickExplore[lang]}
                          {tip.market.illustrative ? ` · ${t.illustrative[lang]}` : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center gap-2 text-[0.62rem] font-semibold tracking-[0.12em] uppercase text-[var(--iti-steel)]">
                          <span className="h-2 w-2 rounded-full" style={{ background: SECTORS[tip.asset.sector].color }} aria-hidden />
                          {tip.asset.status === 'operational' ? t.operational[lang] : t.construction[lang]}
                        </p>
                        <p className="mt-0.5 font-[family-name:var(--iti-head)] text-[0.92rem] leading-tight font-bold">
                          {tip.asset.name}
                          {tip.asset.parent && <span className="font-medium text-[var(--iti-ink-soft)]"> · {tip.asset.parent}</span>}
                        </p>
                        <p className="mt-0.5 text-[0.7rem] text-[var(--iti-ink-soft)]">
                          {tip.asset.city[lang]} · {tip.asset.kind[lang]}
                        </p>
                        <p className="mt-1 text-[0.68rem] text-[var(--iti-copper)]">
                          {t.clickProfile[lang]}
                          {tip.asset.illustrative ? ` · ${t.illustrative[lang]}` : ''}
                        </p>
                      </>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ---------- coordinates readout ---------- */}
            <div className="pointer-events-none absolute end-4 bottom-3 z-10 hidden items-center gap-2 rounded-full border border-white/10 bg-[rgba(3,30,48,0.6)] px-3 py-1 font-mono text-[0.62rem] tracking-wider text-[var(--iti-fp-soft)] backdrop-blur md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--iti-copper-soft)]" aria-hidden />
              <span ref={coordRef} dir="ltr">
                {formatCoord(HQ[0], HQ[1])}
              </span>
            </div>

            {/* ---------- site card ---------- */}
            <AnimatePresence>
              {wide && selected && plantsMode && (
                <SideCard key={selected.id} rtl={rtl}>
                  <AssetCard
                    asset={selected}
                    lang={lang}
                    onClose={() => setSelected(null)}
                    index={selectedSiblings.findIndex((a) => a.id === selected.id)}
                    total={selectedSiblings.length}
                    onPrev={() => stepAsset(-1)}
                    onNext={() => stepAsset(1)}
                  />
                </SideCard>
              )}
            </AnimatePresence>

            {/* ---------- overview card (KSA) ---------- */}
            <AnimatePresence>
              {wide && overviewMarket && (
                <SideCard key={overviewMarket.id} rtl={rtl}>
                  <OverviewCard market={overviewMarket} lang={lang} onClose={() => setOverview(null)} />
                </SideCard>
              )}
            </AnimatePresence>
          </div>

          <p className={`mt-3 px-5 text-center text-[0.68rem] tracking-[0.16em] uppercase text-[var(--iti-fp-soft)] ${focus ? 'max-lg:hidden' : ''}`}>
            {touch ? t.mapHintTouch[lang] : t.mapHint[lang]}
            {!focus && ` · ${t.dragHint[lang]}`}
          </p>

          {/* ---------- phones and tablets: the open market, told under the map ---------- */}
          {focusMarketObj && (
            <div className="iti-map-dock px-5 pt-4 sm:px-8 lg:hidden">
              {/* the four markets, one tap apart */}
              <div ref={tabsRef} className="iti-map-tabs -mx-5 flex gap-2 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8" role="tablist" aria-label={t.markets[lang]}>
                {MARKETS.map((m) => {
                  const on = m.id === focus
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => !on && focusMarket(m.id)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-[0.8rem] font-semibold transition ${
                        on ? 'border-white bg-white text-[var(--iti-navy)]' : 'border-white/20 text-[#dbe7ee] active:border-white/60'
                      }`}
                    >
                      {m.name[lang]}
                    </button>
                  )
                })}
              </div>

              {!wide && selected && plantsMode ? (
                <motion.div key={selected.id} dir={rtl ? 'rtl' : 'ltr'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                  <AssetCard
                    asset={selected}
                    lang={lang}
                    onClose={() => setSelected(null)}
                    index={selectedSiblings.findIndex((a) => a.id === selected.id)}
                    total={selectedSiblings.length}
                    onPrev={() => stepAsset(-1)}
                    onNext={() => stepAsset(1)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={focusMarketObj.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="border-t-2 border-[var(--iti-copper)] pt-5"
                >
                  {marketBrief(focusMarketObj, true)}
                  {/* the market's photograph is on the map above; this only says what kind of picture it is */}
                  {!wide && focusMarketObj.depth === 'overview' && focusMarketObj.illustrative && (
                    <p className="mt-4 text-[0.68rem] tracking-wide text-[var(--iti-fp-soft)]/80">{t.illustrative[lang]}</p>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* ---------- RIGHT: markets + sectors ---------- */}
        <aside className="iti-map-panel iti-panel-scroll relative z-10 flex flex-col gap-10 border-t px-5 py-10 sm:px-8 lg:col-span-3 lg:overflow-y-auto lg:border-t-0 lg:border-s lg:pt-[116px] lg:pb-10">
          <div>
            <p className="iti-panel-label mb-4">
              {t.markets[lang]}
              <span className="iti-panel-count" dir="ltr">{MARKETS.length}</span>
            </p>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {MARKETS.map((m) => {
                const active = focus === m.id
                const hot = hovered === m.id
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => {
                        // below the desktop layout both of these bring the map back under the bar
                        if (active) backToMap()
                        else focusMarket(m.id)
                      }}
                      onMouseEnter={() => !active && setHovered(m.id)}
                      onMouseLeave={() => setHovered(null)}
                      aria-pressed={active}
                      className={`iti-market-row group relative flex w-full items-center gap-4 overflow-hidden py-4 text-start transition ${
                        active ? 'is-active text-white' : hot ? 'text-white' : 'text-[var(--iti-fp-soft)] hover:text-white'
                      }`}
                    >
                      <span
                        className={`h-8 w-[3px] shrink-0 rounded-full transition ${
                          active ? 'bg-[var(--iti-copper-soft)]' : hot ? 'bg-white/60' : 'bg-transparent group-hover:bg-white/20'
                        }`}
                        aria-hidden
                      />
                      <span
                        className={`relative h-10 w-14 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 transition duration-300 ${
                          active || hot ? 'opacity-100' : 'opacity-60 grayscale'
                        }`}
                        aria-hidden
                      >
                        <Picture k={m.photo} sizes="56px" className="h-full w-full object-cover" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[0.95rem] font-semibold text-white">{m.name[lang]}</span>
                        <span className="block text-xs">{marketCounts(m)}</span>
                      </span>
                      <span className="font-[family-name:var(--iti-head)] text-base font-bold tabular-nums text-white" dir="ltr">
                        <AnimatedNumber value={moneyValue(m.investment)} prefix="$" suffix="M" replay margin="0px" />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <p className="iti-panel-label mb-4">{t.sectors[lang]}</p>
            {/* a legend, not a control: it names the pin colours and does nothing when pressed */}
            <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
              {SECTOR_ORDER.map((s) => (
                <li key={s} className="inline-flex items-center gap-2 text-[0.78rem] text-[#dbe7ee]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-[1.5px] ring-white/80" style={{ background: SECTORS[s].color }} aria-hidden />
                  {SECTORS[s].label[lang]}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.68rem] leading-relaxed text-[var(--iti-fp-soft)]/85">{t.sectorsHint[lang]}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--iti-fp-soft)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-[var(--iti-navy)]" aria-hidden />
                {t.operational[lang]}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-dashed border-white" aria-hidden />
                {t.construction[lang]}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Map motion pieces                                                   */
/* ------------------------------------------------------------------ */

/** A link leaving Barcelona: the route draws itself while a copper dot travels it */
function RouteTrace({ d, k, reduceMotion, strong = true }: { d: string; k: number; reduceMotion: boolean; strong?: boolean }) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const dotRef = useRef<SVGCircleElement | null>(null)

  useEffect(() => {
    const p = pathRef.current
    const dot = dotRef.current
    if (!p || !dot) return
    const len = p.getTotalLength()
    p.style.strokeDasharray = `${len}`
    const place = (v: number) => {
      const pt = p.getPointAtLength(v * len)
      dot.setAttribute('cx', `${pt.x}`)
      dot.setAttribute('cy', `${pt.y}`)
      dot.style.opacity = '1'
      p.style.strokeDashoffset = `${len * (1 - v)}`
    }
    if (reduceMotion) {
      place(1)
      return
    }
    place(0)
    const ctrl = animate(0, 1, { duration: Math.min(1.6, 0.6 + len / 900), ease: [0.45, 0, 0.2, 1], onUpdate: place })
    return () => ctrl.stop()
  }, [d, reduceMotion])

  return (
    <>
      <path ref={pathRef} d={d} fill="none" stroke="#e39a6b" strokeOpacity={strong ? 0.95 : 0.55} strokeWidth={(strong ? 1.4 : 1) * k} strokeLinecap="round" />
      <circle ref={dotRef} r={(strong ? 3 : 2.2) * k} fill="#e39a6b" stroke="#ffffff" strokeWidth={1.2 * k} style={{ opacity: 0 }} />
    </>
  )
}

/** "$370M" counting up from zero whenever it mounts */
function MoneyCount({ value, duration = 1100 }: { value: string; duration?: number }) {
  const n = useCountUp(moneyValue(value), duration, true)
  return <>{`$${n}M`}</>
}

const moneyValue = (v: string) => parseInt(v.replace(/\D/g, ''), 10) || 0

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

/** Card pinned to the free right side of a focused frame (the map is never mirrored, so this is physical right). Tablets and up; on phones the card sits under the map */
function SideCard({ rtl, children }: { rtl: boolean; children: ReactNode }) {
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="iti-sheet absolute top-1/2 right-[2.5%] z-40 max-h-[calc(100%-1rem)] w-[min(420px,44%)] -translate-y-1/2 overflow-y-auto overscroll-contain rounded-2xl"
      role="dialog"
    >
      <motion.div
        initial={{ opacity: 0, x: 18, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 10, scale: 0.99 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function CloseButton({ onClose, label, top = 'top-3' }: { onClose: () => void; label: string; top?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className={`absolute ${top} end-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--iti-line)] bg-white text-[var(--iti-navy)] transition hover:border-[var(--iti-navy)] hover:bg-[var(--iti-mist)]`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function StepButton({ onClick, label, flip }: { onClick: () => void; label: string; flip: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--iti-line)] text-[var(--iti-navy)] transition hover:border-[var(--iti-navy)] hover:bg-[var(--iti-mist)]"
    >
      <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${flip ? 'rotate-180' : ''}`} aria-hidden>
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function AssetCard({
  asset,
  lang,
  onClose,
  index,
  total,
  onPrev,
  onNext,
}: {
  asset: Asset
  lang: Lang
  onClose: () => void
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
}) {
  const t = COPY.footprint
  const sector = SECTORS[asset.sector]
  const hasSite = asset.url !== PLACEHOLDER_URL
  const statusLabel = asset.status === 'operational' ? t.operational[lang] : t.construction[lang]
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white text-[var(--iti-navy)] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.7)] ring-1 ring-black/5">
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${sector.color}, #a9613a)` }} aria-hidden />
      <CloseButton onClose={onClose} label={t.close[lang]} top="top-[1.1rem]" />
      {/* Every site reads at one size: the logo, the name, one line of kind, two facts, one short paragraph, the link.
          The close button shares the logo's row, so the text below has the card's full width; and the body keeps a
          minimum height, so stepping through a country's sites never makes the card jump. */}
      <div className="flex flex-col px-5 pt-4 pb-4 md:min-h-[31rem]">
        <div className="flex h-10 items-center pe-10">
          {asset.logo ? (
            <img src={asset.logo} alt="" className="h-full w-auto max-w-[9.5rem] object-contain" loading="lazy" draggable={false} />
          ) : (
            <span className="grid h-10 min-w-10 place-items-center rounded-lg bg-[var(--iti-mist)] px-2.5 font-[family-name:var(--iti-head)] text-[0.78rem] font-extrabold tracking-[0.06em] text-[var(--iti-navy)]">
              {asset.monogram}
            </span>
          )}
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {asset.parent && (
            <p className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-[var(--iti-copper)]">{asset.parent}</p>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold tracking-wide ${
              asset.status === 'operational'
                ? 'bg-[var(--iti-mist)] text-[var(--iti-navy)]'
                : 'bg-[var(--iti-copper)] text-white'
            }`}
          >
            {statusLabel}
          </span>
          {asset.illustrative && (
            <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[0.58rem] font-medium tracking-wide text-[var(--iti-ink-soft)]">
              {t.illustrative[lang]}
            </span>
          )}
        </div>

        <h3 className="mt-2.5 font-[family-name:var(--iti-head)] text-[1.35rem] leading-tight font-bold tracking-[-0.01em]">
          {asset.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--iti-ink-soft)]">{asset.city[lang]}</p>

        <p className="mt-3 text-[0.72rem] leading-relaxed text-[var(--iti-steel)]">
          <span className="font-semibold tracking-[0.08em] uppercase">{asset.kind[lang]}</span>
          <span className="text-[var(--iti-ink-soft)]">
            {' · '}
            {asset.milestone[lang]}
            {asset.investment ? ` · ${asset.investment}` : ''}
          </span>
        </p>

        {asset.facts && asset.facts.length > 0 && (
          <dl className="mt-4 border-t border-[var(--iti-line)]">
            {asset.facts.slice(0, 2).map((fact) => (
              <div
                key={fact.k.en}
                className="flex items-baseline justify-between gap-4 border-b border-[var(--iti-line)] py-2"
              >
                <dt className="shrink-0 text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-[var(--iti-ink-soft)]">
                  {fact.k[lang]}
                </dt>
                <dd className="text-end text-[0.9rem] leading-snug font-semibold">{fact.v[lang]}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className="mt-4 mb-4 text-[0.88rem] leading-[1.65] text-[var(--iti-ink-soft)]">{asset.about[lang]}</p>

        {hasSite && (
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-auto inline-flex items-center gap-2 self-start border-b border-[var(--iti-copper)] pb-0.5 text-sm font-semibold text-[var(--iti-copper)] transition hover:border-[var(--iti-navy)] hover:text-[var(--iti-navy)]"
          >
            {t.visit[lang]}
            <span className="font-normal text-[var(--iti-ink-soft)]" dir="ltr">
              {asset.url.replace(/^https?:\/\/(www\.)?/, '')}
            </span>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" aria-hidden>
              <path d="M5 11L11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
            </svg>
          </a>
        )}
      </div>
      {total > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--iti-line)] px-5 py-3">
          <StepButton onClick={onPrev} label={t.prev[lang]} flip={lang === 'ar'} />
          <span dir="ltr" className="text-[0.75rem] font-semibold tabular-nums text-[var(--iti-ink-soft)]">
            {index + 1} / {total}
          </span>
          <StepButton onClick={onNext} label={t.next[lang]} flip={lang !== 'ar'} />
        </div>
      )}
    </div>
  )
}

function IllustrativeTag({ label }: { label: string }) {
  return (
    <span className="absolute top-2.5 start-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[0.58rem] font-medium tracking-wide text-white/90 backdrop-blur">
      {label}
    </span>
  )
}

function OverviewCard({ market, lang, onClose }: { market: Market; lang: Lang; onClose: () => void }) {
  const t = COPY.footprint
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white text-[var(--iti-navy)] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.7)]">
      <CloseButton onClose={onClose} label={t.close[lang]} />
      <div className="relative h-32 overflow-hidden bg-[var(--iti-navy)]">
        <Picture k={market.photo} sizes="330px" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {market.illustrative && <IllustrativeTag label={t.illustrative[lang]} />}
      </div>
      <div className="h-1 bg-[var(--iti-copper)]" aria-hidden />
      <div className="p-5 pt-4">
        <p className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-[var(--iti-steel)]">{market.name[lang]}</p>
        <p className="mt-1 font-[family-name:var(--iti-head)] text-lg font-bold">{market.headline[lang]}</p>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--iti-ink-soft)]">{market.summary[lang]}</p>
        {market.points && (
          <ul className="mt-3 space-y-1.5">
            {market.points.map((p) => (
              <li key={p.en} className="flex gap-2 text-[0.76rem] leading-snug">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--iti-copper)]" aria-hidden />
                {p[lang]}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-baseline justify-between border-t border-[var(--iti-line)] pt-3">
          <span className="text-xs text-[var(--iti-ink-soft)]">{t.investment[lang]}</span>
          <span className="font-[family-name:var(--iti-head)] text-xl font-extrabold tabular-nums" dir="ltr">
            <MoneyCount value={market.investment} duration={900} />
          </span>
        </div>
      </div>
    </div>
  )
}
