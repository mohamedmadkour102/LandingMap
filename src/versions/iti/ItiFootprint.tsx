import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, animate, motion } from 'framer-motion'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import countries110Topo from 'world-atlas/countries-110m.json'
import { worldCountries as countries50 } from '../../maps/worldData'
import { AnimatedNumber } from '../../components/AnimatedNumber'
import { useCountUp } from '../../hooks/useCountUp'
import {
  ASSETS,
  CITY_LABELS,
  COPY,
  MARKETS,
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
const H = 620

type LatLng = [number, number]
type CountryFeature = Feature<Geometry, { name?: string }> & { id?: string | number }

/** Antarctica explodes under Mercator and is never in frame */
const notAntarctica = (f: CountryFeature) => String(f.id) !== '010'

const topo110 = countries110Topo as unknown as Topology<{ countries: GeometryCollection }>
const countries110 = (
  feature(topo110, topo110.objects.countries) as FeatureCollection<Geometry, { name?: string }>
).features.filter(notAntarctica) as CountryFeature[]
const countriesHi = (countries50.features as CountryFeature[]).filter(notAntarctica)

const marketByIso = new Map<string, Market>()
for (const m of MARKETS) for (const iso of m.iso) marketByIso.set(iso, m)

/** Mercator camera: screen = translate + scale × unit-mercator */
interface View {
  k: number
  tx: number
  ty: number
}

const multiPoint = (pts: LatLng[]) => ({
  type: 'MultiPoint' as const,
  coordinates: pts.map(([lat, lng]) => [lng, lat]),
})

function fitView(pts: LatLng[], extent: [[number, number], [number, number]]): View {
  const p = d3.geoMercator().fitExtent(extent, multiPoint(pts) as never)
  const [tx, ty] = p.translate()
  return { k: p.scale(), tx, ty }
}

/** From the U.S. Gulf Coast to the Arabian Gulf */
const HOME = fitView(
  [
    [56, -123],
    [17, -123],
    [56, 66],
    [12, 66],
  ],
  [
    [28, 28],
    [W - 28, H - 28],
  ],
)

/** Width (SVG units) reserved on the right of a focused frame for the side card */
const CARD_SPACE = 380
const FRAME_PAD = 48

const frameView = (m: Market, reserveCard: boolean) =>
  fitView(m.frame, [
    [FRAME_PAD, FRAME_PAD],
    [W - (reserveCard ? CARD_SPACE : FRAME_PAD), H - FRAME_PAD],
  ])

/** Desktop frames leave room for the side card; on mobile the card is a bottom sheet */
const FRAMES_WIDE = Object.fromEntries(MARKETS.map((m) => [m.id, frameView(m, true)])) as Record<MarketId, View>
const FRAMES_NARROW = Object.fromEntries(MARKETS.map((m) => [m.id, frameView(m, false)])) as Record<MarketId, View>

/** View <-> d3.interpolateZoom space ([centre x, centre y, width] in unit-Mercator) */
const toZoom = (v: View): [number, number, number] => [(W / 2 - v.tx) / v.k, (H / 2 - v.ty) / v.k, W / v.k]
const fromZoom = ([ux, uy, w]: number[]): View => {
  const k = W / w
  return { k, tx: W / 2 - k * ux, ty: H / 2 - k * uy }
}

const HQ: LatLng = [41.39, 2.17]

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
}
const PIN_OFFSET: Record<string, [number, number]> = {
  european: [-46, 6],
  ventura: [-16, 22],
  amreyah: [14, 6],
  cimpor: [44, 20],
  'royal-elminya': [0, -24],
  cleopatra: [22, 12],
  cyprometal: [-22, 12],
}

/** City label placement relative to the city point, in SVG units (scaled with the pins) */
const CITY_LABEL_POS: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' }> = {
  Alexandria: { dx: 0, dy: -20, anchor: 'middle' },
  'El Minya': { dx: 36, dy: -16, anchor: 'start' },
  Assiut: { dx: 17, dy: 5, anchor: 'start' },
  Houston: { dx: 0, dy: -19, anchor: 'middle' },
  Tampa: { dx: 0, dy: -19, anchor: 'middle' },
}

const CONTEXT_LABELS: { market: MarketId; at: LatLng; name: Record<Lang, string> }[] = [
  { market: 'egypt', at: [32.55, 28.6], name: { en: 'Mediterranean Sea', ar: 'البحر المتوسط' } },
  { market: 'egypt', at: [24.6, 35.9], name: { en: 'Red Sea', ar: 'البحر الأحمر' } },
  { market: 'usa', at: [25.6, -90.5], name: { en: 'Gulf of Mexico', ar: 'خليج المكسيك' } },
  { market: 'usa', at: [31.5, -72.5], name: { en: 'Atlantic Ocean', ar: 'المحيط الأطلسي' } },
]

function formatCoord(lat: number, lng: number) {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}° ${ns}  ·  ${Math.abs(lng).toFixed(2)}° ${ew}`
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

const OCEAN = '#eaeff1'

export default function ItiFootprint({ lang }: Props) {
  const t = COPY.footprint
  const uid = useId().replace(/:/g, '')
  const rtl = lang === 'ar'

  const [view, setView] = useState<View>(HOME)
  const viewRef = useRef<View>(HOME)
  const [settled, setSettled] = useState(true)
  const [focus, setFocus] = useState<MarketId | null>(null)
  const [hovered, setHovered] = useState<MarketId | null>(null)
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null)
  const [hqHover, setHqHover] = useState(false)
  const [selected, setSelected] = useState<Asset | null>(null)
  const [overview, setOverview] = useState<MarketId | null>(null)
  const [sector, setSector] = useState<SectorId | null>(null)
  const [wide, setWide] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches)
  /** Marker scale: the map shrinks on small screens, pins and labels must not */
  const [k, setK] = useState(1)
  const [boxW, setBoxW] = useState(0)
  const mapBoxRef = useRef<HTMLDivElement | null>(null)
  const coordRef = useRef<HTMLSpanElement | null>(null)
  const FRAMES = wide ? FRAMES_WIDE : FRAMES_NARROW

  const animRef = useRef<number>(0)

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const commit = useCallback((v: View) => {
    viewRef.current = v
    setView(v)
  }, [])

  /* ---------------- camera ---------------- */

  const flyTo = useCallback(
    (target: View, onDone?: () => void) => {
      cancelAnimationFrame(animRef.current)
      const interp = d3.interpolateZoom(toZoom(viewRef.current), toZoom(target))
      const dur = reduceMotion ? 1 : Math.min(1700, Math.max(750, interp.duration * 0.75))
      const start = performance.now()
      setSettled(false)

      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        commit(fromZoom(interp(d3.easeCubicInOut(p))))
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

  const focusMarket = useCallback(
    (id: MarketId) => {
      const m = MARKETS.find((x) => x.id === id)!
      setSelected(null)
      setOverview(null)
      setFocus(id)
      setHovered(null)
      setHoveredAssetId(null)
      flyTo(FRAMES[id], () => {
        if (m.depth === 'overview') setOverview(id)
      })
    },
    [flyTo, FRAMES],
  )

  const backToMap = useCallback(() => {
    setSelected(null)
    setOverview(null)
    setFocus(null)
    setHoveredAssetId(null)
    flyTo(HOME)
  }, [flyTo])

  useEffect(() => () => cancelAnimationFrame(animRef.current), [])

  /* ---------------- responsive frame + marker scale ---------------- */

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
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

  // Re-frame an open market when crossing the mobile/desktop breakpoint
  useEffect(() => {
    if (focus && settled) commit(FRAMES[focus])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wide])

  /* ---------------- derived geometry ---------------- */

  const projection = useMemo(() => d3.geoMercator().scale(view.k).translate([view.tx, view.ty]), [view])
  const path = useMemo(() => d3.geoPath(projection), [projection])
  const features = settled && focus ? countriesHi : countries110
  const countryPaths = useMemo(
    () => features.map((f) => ({ iso: String(f.id), d: path(f as never) ?? '' })).filter((c) => c.d),
    [features, path],
  )
  const graticuleD = useMemo(() => path(d3.geoGraticule10() as never) ?? '', [path])

  const project = (lat: number, lng: number) => projection([lng, lat]) as [number, number]
  const inBox = ([x, y]: [number, number]) => x > 0 && x < W && y > 0 && y < H

  const focusMarketObj = focus ? MARKETS.find((m) => m.id === focus)! : null
  const hoveredMarket = hovered ? MARKETS.find((m) => m.id === hovered)! : null
  const plantsMode = focusMarketObj?.depth === 'plants' && settled
  const hoveredAsset = hoveredAssetId ? ASSETS.find((a) => a.id === hoveredAssetId) ?? null : null

  /** Which photo fills which country right now */
  const photo = useMemo(() => {
    const asset = plantsMode ? hoveredAsset ?? selected : null
    if (asset) return { market: MARKETS.find((m) => m.id === asset.market)!, href: asset.photo }
    if (hoveredMarket && hoveredMarket.id !== focus) return { market: hoveredMarket, href: hoveredMarket.photo }
    if (focusMarketObj?.depth === 'overview') return { market: focusMarketObj, href: focusMarketObj.photo }
    return null
  }, [plantsMode, hoveredAsset, selected, hoveredMarket, focus, focusMarketObj])

  const photoBounds = useMemo(() => {
    if (!photo) return null
    const b = path.bounds(multiPoint(photo.market.frame) as never)
    if (!b || !Number.isFinite(b[0][0])) return null
    return b as [[number, number], [number, number]]
  }, [photo, path])
  const photoIsos = photo && photoBounds ? photo.market.iso : []

  const assetsInFocus = plantsMode ? ASSETS.filter((a) => a.market === focus) : []
  const pins = assetsInFocus.map((a) => {
    const hub = CITY_POINT[a.city.en]
    const off = PIN_OFFSET[a.id]
    const p = hub && off ? project(hub[0], hub[1]) : project(a.coords[0], a.coords[1])
    return { asset: a, x: p[0] + (hub && off ? off[0] * k : 0), y: p[1] + (hub && off ? off[1] * k : 0) }
  })

  const overviewMarket = overview ? MARKETS.find((m) => m.id === overview)! : null

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
    const cardLeft = W * 0.975 - Math.min(300, 0.34 * boxW) * (W / boxW)
    if (cardLeft < src[0] + 30) return null
    const ty = Math.min(H * 0.66, Math.max(H * 0.34, src[1]))
    const mx = src[0] + (cardLeft - src[0]) * 0.55
    return { key, sx: src[0], sy: src[1], ex: cardLeft, ey: ty, d: `M${src[0]},${src[1]} C${mx},${src[1]} ${mx},${ty} ${cardLeft},${ty}` }
  })()

  const tip: Tip | null = (() => {
    if (plantsMode && hoveredAsset && hoveredAsset.id !== selected?.id) {
      const pin = pins.find((p) => p.asset.id === hoveredAsset.id)
      if (pin) return { key: hoveredAsset.id, kind: 'asset', asset: hoveredAsset, x: pin.x, y: pin.y }
    }
    if (hoveredMarket && hoveredMarket.id !== focus && settled) {
      const p = project(hoveredMarket.anchor[0], hoveredMarket.anchor[1])
      if (inBox(p)) return { key: hoveredMarket.id, kind: 'market', market: hoveredMarket, x: p[0], y: p[1] }
    }
    if (hqHover && !focus) {
      const p = project(HQ[0], HQ[1])
      return { key: 'hq', kind: 'hq', x: p[0], y: p[1] }
    }
    return null
  })()

  /* ---------------- interactions ---------------- */

  function onCountryClick(iso: string) {
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
    setSelected((cur) => (cur?.id === a.id ? null : a))
  }

  const stepAsset = useCallback(
    (dir: 1 | -1) => {
      setSelected((cur) => {
        if (!cur) return cur
        const list = ASSETS.filter((a) => a.market === cur.market)
        const i = list.findIndex((a) => a.id === cur.id)
        return list[(i + dir + list.length) % list.length]
      })
    },
    [],
  )

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
    if (m.id === 'europe') return `${m.iso.length} ${t.countries[lang]}`
    return `2 ${t.plants[lang]}`
  }

  const selectedSiblings = selected ? ASSETS.filter((a) => a.market === selected.market) : []

  /* ---------------- render ---------------- */

  return (
    <section
      id="footprint"
      className="iti-footprint relative overflow-hidden text-[var(--iti-navy)]"
      style={{ background: OCEAN }}
    >
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-12">
        {/* ---------- LEFT: narrative ---------- */}
        <aside className="iti-map-panel relative z-10 flex flex-col px-5 pt-20 pb-6 sm:px-8 lg:col-span-3 lg:border-e lg:border-[var(--iti-line)] lg:py-24">
          <p className="iti-eyebrow">{t.eyebrow[lang]}</p>
          <h2 className="iti-h2 mt-5">{t.title[lang]}</h2>
          <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-[var(--iti-ink-soft)]">{t.body[lang]}</p>

          <div className="mt-8 lg:mt-10 lg:min-h-[220px]">
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
                  <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-[var(--iti-steel)]">
                    {focusMarketObj.name[lang]}
                  </p>
                  <p className="mt-2 font-[family-name:var(--iti-head)] text-4xl font-extrabold tracking-tight tabular-nums" dir="ltr">
                    <MoneyCount value={focusMarketObj.investment} />
                  </p>
                  <p className="text-xs tracking-wide text-[var(--iti-ink-soft)]">{t.investment[lang]}</p>
                  <p className="mt-4 text-sm font-semibold leading-snug">{focusMarketObj.headline[lang]}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--iti-ink-soft)]">{focusMarketObj.summary[lang]}</p>

                  {focusMarketObj.depth === 'plants' && (
                    <div className="mt-6 hidden lg:block">
                      <p className="mb-2 text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-[var(--iti-ink-soft)]">
                        {t.sitesList[lang]}
                      </p>
                      <ul className="divide-y divide-[var(--iti-line)] border-y border-[var(--iti-line)]">
                        {ASSETS.filter((a) => a.market === focusMarketObj.id).map((a) => {
                          const on = selected?.id === a.id
                          const dim = sector != null && sector !== a.sector
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
                                className={`group flex w-full items-center gap-3 py-2.5 text-start transition ${
                                  dim ? 'opacity-40' : ''
                                } ${on ? 'text-[var(--iti-navy)]' : 'text-[var(--iti-ink-soft)] hover:text-[var(--iti-navy)]'}`}
                              >
                                <span
                                  className={`h-3 w-3 shrink-0 rounded-full ring-2 ring-[var(--iti-navy)] ${
                                    a.status === 'construction' ? 'outline-1 outline-offset-2 outline-dashed outline-[var(--iti-navy)]' : ''
                                  }`}
                                  style={{ background: SECTORS[a.sector].color }}
                                  aria-hidden
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[0.82rem] font-semibold text-[var(--iti-navy)]">{a.name}</span>
                                  <span className="block text-[0.7rem]">{a.city[lang]}</span>
                                </span>
                                <span
                                  aria-hidden
                                  className={`text-xs text-[var(--iti-copper)] transition ${
                                    on ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                  } ${rtl ? 'rotate-180' : ''}`}
                                >
                                  →
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                      <p className="mt-3 text-xs font-medium text-[var(--iti-steel)]">{t.hintPlants[lang]}</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 text-xs font-medium tracking-wide text-[var(--iti-steel)]"
                >
                  <span className="iti-pulse-dot" aria-hidden />
                  {t.hint[lang]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* ---------- CENTER: map ---------- */}
        <div className="relative flex flex-col justify-center px-2 pb-6 sm:px-4 lg:col-span-6 lg:min-h-[100svh] lg:py-10">
          <div ref={mapBoxRef} className="relative mx-auto w-full max-w-[980px]" style={{ aspectRatio: `${W} / ${H}` }}>
            <AnimatePresence>
              {focus && (
                <motion.button
                  type="button"
                  key="back"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onClick={backToMap}
                  className="absolute bottom-2 left-2 z-30 inline-flex items-center gap-2 rounded-full border border-[var(--iti-line)] bg-white/90 px-4 py-2 text-xs font-semibold text-[var(--iti-navy)] shadow-sm backdrop-blur transition hover:border-[var(--iti-navy)] md:top-3 md:bottom-auto md:left-3"
                >
                  <span aria-hidden className={rtl ? 'rotate-180' : ''}>
                    ←
                  </span>
                  {t.back[lang]}
                </motion.button>
              )}
            </AnimatePresence>

            <div className="absolute inset-0">
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-full w-full overflow-visible select-none"
                role="img"
                aria-label={t.mapLabel[lang]}
                style={{ direction: 'ltr' }}
                onPointerMove={onMapPointerMove}
                onPointerLeave={() => {
                  setHovered(null)
                  setHoveredAssetId(null)
                }}
              >
                <defs>
                  {photo && photoBounds && (
                    /* one tile spanning the whole canvas, so the photo never repeats onto
                       outlying territory (e.g. Alaska) beyond the market frame */
                    <pattern
                      id={`${uid}-photo`}
                      patternUnits="userSpaceOnUse"
                      x={-W * 3}
                      y={-H * 3}
                      width={W * 7}
                      height={H * 7}
                    >
                      <rect width={W * 7} height={H * 7} fill={focus ? '#8fa9b8' : '#215c7e'} />
                      <rect
                        x={photoBounds[0][0] + W * 3}
                        y={photoBounds[0][1] + H * 3}
                        width={Math.max(1, photoBounds[1][0] - photoBounds[0][0])}
                        height={Math.max(1, photoBounds[1][1] - photoBounds[0][1])}
                        fill="#053552"
                      />
                      <image
                        key={photo.href}
                        className="iti-photo-in"
                        href={photo.href}
                        x={photoBounds[0][0] + W * 3}
                        y={photoBounds[0][1] + H * 3}
                        width={Math.max(1, photoBounds[1][0] - photoBounds[0][0])}
                        height={Math.max(1, photoBounds[1][1] - photoBounds[0][1])}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </pattern>
                  )}
                </defs>

                {/* ocean — oversized so the map bleeds under both side panels */}
                <rect
                  x={-W * 3}
                  y={-H * 3}
                  width={W * 7}
                  height={H * 7}
                  fill={OCEAN}
                  onClick={() => selected && setSelected(null)}
                />
                <path d={graticuleD} fill="none" stroke="#053552" strokeOpacity={0.06} strokeWidth={0.6} pointerEvents="none" />

                {/* countries */}
                {countryPaths.map(({ iso, d }) => {
                  const m = marketByIso.get(iso)
                  const isFocus = m != null && m.id === focus
                  const isPhoto = photoIsos.includes(iso)
                  const building = m?.isoUnderConstruction?.includes(iso)

                  let fill = focus ? '#d3dbdf' : '#c9d3d8'
                  let opacity = 1
                  if (m) {
                    if (isPhoto) fill = `url(#${uid}-photo)`
                    else if (isFocus) fill = '#ffffff'
                    else fill = focus ? '#8fa9b8' : '#215c7e'
                    if (focus && !isFocus && !isPhoto) opacity = 0.75
                  }

                  return (
                    <path
                      key={iso + (settled && focus ? 'h' : 'l')}
                      d={d}
                      fill={fill}
                      opacity={opacity}
                      stroke={m && (isFocus || isPhoto) ? '#053552' : '#ffffff'}
                      strokeWidth={m ? (isPhoto ? 1.8 : isFocus ? 1.6 : 0.7) : 0.45}
                      strokeDasharray={building ? '4 3' : undefined}
                      strokeLinejoin="round"
                      className={m ? 'cursor-pointer transition-[fill] duration-300' : undefined}
                      onMouseEnter={() => m && m.id !== focus && setHovered(m.id)}
                      onMouseLeave={() => m && setHovered((cur) => (cur === m.id ? null : cur))}
                      onClick={() => onCountryClick(iso)}
                    />
                  )
                })}

                {/* light navy wash over a plant photo keeps pins and labels readable */}
                {plantsMode &&
                  photoIsos.length > 0 &&
                  countryPaths
                    .filter((c) => photoIsos.includes(c.iso))
                    .map((c) => (
                      <path key={`wash-${c.iso}`} d={c.d} fill="#053552" fillOpacity={0.18} pointerEvents="none" />
                    ))}

                {/* network routes from the Barcelona head office */}
                {!focus &&
                  MARKETS.map((m) => {
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
                      <g key={`route-${m.id}`} pointerEvents="none">
                        <path
                          d={d}
                          fill="none"
                          stroke="#053552"
                          strokeOpacity={hovered && !on ? 0.16 : 0.32}
                          strokeWidth={1.2 * k}
                          strokeDasharray="4 6"
                          strokeLinecap="round"
                          className={hovered ? undefined : 'iti-flow'}
                        />
                        {on && settled && <RouteTrace d={d} k={k} reduceMotion={reduceMotion} />}
                      </g>
                    )
                  })}

                {/* head office */}
                {!focus &&
                  (() => {
                    const p = project(HQ[0], HQ[1])
                    return (
                      <g
                        transform={`translate(${p[0]} ${p[1]}) scale(${k})`}
                        className="cursor-default"
                        onMouseEnter={() => setHqHover(true)}
                        onMouseLeave={() => setHqHover(false)}
                      >
                        <circle r={14} fill="transparent" />
                        {hqHover && <circle r={14} fill="#053552" opacity={0.25} className="iti-ping" />}
                        <rect
                          x={-5}
                          y={-5}
                          width={10}
                          height={10}
                          transform={`rotate(45) scale(${hqHover ? 1.25 : 1})`}
                          fill="#053552"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                        <text x={-11} y={4} textAnchor="end" className="iti-city-label" style={{ fontSize: 10.5, strokeWidth: 3.5 }}>
                          {t.hq[lang]}
                        </text>
                      </g>
                    )
                  })()}

                {/* market markers */}
                {!focus &&
                  MARKETS.map((m) => {
                    const p = project(m.anchor[0], m.anchor[1])
                    const active = hovered === m.id
                    return (
                      <g
                        key={m.id}
                        transform={`translate(${p[0]} ${p[1]})`}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={m.name[lang]}
                        onMouseEnter={() => setHovered(m.id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(m.id)}
                        onBlur={() => setHovered(null)}
                        onClick={() => focusMarket(m.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            focusMarket(m.id)
                          }
                        }}
                      >
                        <g transform={`scale(${k})`}>
                          <circle r={22} fill="transparent" />
                          <circle r={16} fill="#a9613a" opacity={0.18} className="iti-ping" />
                          <circle className="iti-pin-core" r={active ? 8.5 : 6.5} fill="#a9613a" stroke="#fff" strokeWidth={2} />
                          <g transform={`translate(${LABEL_POS[m.id].dx} ${LABEL_POS[m.id].dy})`}>
                            <text
                              textAnchor={LABEL_POS[m.id].anchor}
                              className="iti-map-label"
                              fontSize={active ? 14.5 : 12.5}
                              fontWeight={700}
                            >
                              {(m.mapName ?? m.name)[lang]}
                            </text>
                          </g>
                        </g>
                      </g>
                    )
                  })}

                {/* zoomed: sea + city labels */}
                {plantsMode &&
                  CONTEXT_LABELS.filter((c) => c.market === focus).map((c) => {
                    const p = project(c.at[0], c.at[1])
                    return (
                      <text
                        key={c.name.en}
                        x={p[0]}
                        y={p[1]}
                        textAnchor="middle"
                        className="iti-sea-label"
                        style={{ fontSize: 13 * k }}
                      >
                        {c.name[lang]}
                      </text>
                    )
                  })}
                {plantsMode &&
                  CITY_LABELS.filter((c) => c.market === focus).map((c) => {
                    const p = project(c.at[0], c.at[1])
                    const pos = CITY_LABEL_POS[c.name.en]
                    return (
                      <motion.text
                        key={c.name.en}
                        x={p[0] + pos.dx * k}
                        y={p[1] + pos.dy * k}
                        textAnchor={pos.anchor}
                        className="iti-city-label"
                        style={{ fontSize: 13 * k, strokeWidth: 4 * k }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        pointerEvents="none"
                      >
                        {c.name[lang]}
                      </motion.text>
                    )
                  })}

                {/* leader line to the open card */}
                <AnimatePresence>
                  {leader && (
                    <motion.g
                      key={`leader-${leader.key}`}
                      pointerEvents="none"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    >
                      <motion.path
                        d={leader.d}
                        fill="none"
                        stroke="#a9613a"
                        strokeWidth={1.4 * k}
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.12, ease: [0.4, 0, 0.2, 1] }}
                      />
                      <motion.circle
                        cx={leader.ex}
                        cy={leader.ey}
                        r={3.2 * k}
                        fill="#a9613a"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: reduceMotion ? 0 : 0.62 }}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                      />
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* zoomed: plant pins */}
                {pins.map(({ asset, x, y }, i) => {
                  const color = SECTORS[asset.sector].color
                  const isSel = selected?.id === asset.id
                  const isHover = hoveredAssetId === asset.id
                  const dim = sector != null && sector !== asset.sector
                  return (
                    <motion.g
                      key={asset.id}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: dim ? 0.22 : 1, scale: isHover && !isSel ? 1.18 : 1 }}
                      transition={{ delay: isHover ? 0 : 0.1 + i * 0.07, type: 'spring', stiffness: 300, damping: 18 }}
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
                        {(isSel || isHover) && <circle r={16} fill={color} opacity={0.3} className="iti-ping" />}
                        {isSel && <circle r={17} fill="none" stroke="#a9613a" strokeWidth={2} />}
                        {asset.status === 'construction' && (
                          <circle r={13} fill="none" stroke="#ffffff" strokeWidth={1.4} strokeDasharray="2.5 2.5" />
                        )}
                        <circle r={10.5} fill="#ffffff" />
                        <circle className="iti-pin-core" r={isSel ? 8.5 : 7.5} fill={color} stroke="#053552" strokeWidth={2} />
                      </g>
                    </motion.g>
                  )
                })}
              </svg>
            </div>

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
                    className="w-max max-w-[230px] rounded-xl bg-[var(--iti-navy)] px-3.5 py-2.5 text-white shadow-[0_14px_30px_-12px_rgba(5,53,82,0.7)]"
                  >
                    {tip.kind === 'hq' ? (
                      <>
                        <p className="text-[0.62rem] font-semibold tracking-[0.16em] uppercase text-white/55">{t.hqRole[lang]}</p>
                        <p className="mt-0.5 font-[family-name:var(--iti-head)] text-[0.95rem] font-bold">{t.hq[lang]}</p>
                      </>
                    ) : tip.kind === 'market' ? (
                      <>
                        <p className="text-[0.62rem] font-semibold tracking-[0.16em] uppercase text-white/55">
                          {marketCounts(tip.market)}
                        </p>
                        <p className="mt-0.5 flex items-baseline gap-3 font-[family-name:var(--iti-head)] text-[0.95rem] font-bold">
                          {tip.market.name[lang]}
                          <span className="text-[var(--iti-copper-soft)]">{tip.market.investment}</span>
                        </p>
                        <p className="mt-1 text-[0.68rem] text-white/60">
                          {t.clickExplore[lang]}
                          {tip.market.illustrative ? ` · ${t.illustrative[lang]}` : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center gap-2 text-[0.62rem] font-semibold tracking-[0.12em] uppercase text-white/55">
                          <span className="h-2 w-2 rounded-full" style={{ background: SECTORS[tip.asset.sector].color }} aria-hidden />
                          {tip.asset.status === 'operational' ? t.operational[lang] : t.construction[lang]}
                        </p>
                        <p className="mt-0.5 font-[family-name:var(--iti-head)] text-[0.92rem] leading-tight font-bold">{tip.asset.name}</p>
                        <p className="mt-0.5 text-[0.7rem] text-white/70">
                          {tip.asset.city[lang]} · {tip.asset.kind[lang]}
                        </p>
                        <p className="mt-1 text-[0.68rem] text-white/50">
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
            <div className="pointer-events-none absolute end-4 bottom-3 z-10 hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-mono text-[0.62rem] tracking-wider text-[var(--iti-steel)] backdrop-blur md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--iti-copper)]" aria-hidden />
              <span ref={coordRef} dir="ltr">
                {formatCoord(HQ[0], HQ[1])}
              </span>
            </div>

            {/* ---------- asset card (Egypt / USA) ---------- */}
            <AnimatePresence>
              {selected && plantsMode && (
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

            {/* ---------- overview card (Europe / KSA) ---------- */}
            <AnimatePresence>
              {overviewMarket && (
                <SideCard key={overviewMarket.id} rtl={rtl}>
                  <OverviewCard market={overviewMarket} lang={lang} onClose={() => setOverview(null)} />
                </SideCard>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-3 text-center text-[0.68rem] tracking-[0.16em] uppercase text-[var(--iti-ink-soft)]">
            {t.mapHint[lang]}
          </p>
        </div>

        {/* ---------- RIGHT: markets + sectors ---------- */}
        <aside className="iti-map-panel relative z-10 flex flex-col gap-10 border-t border-[var(--iti-line)] px-5 py-10 sm:px-8 lg:col-span-3 lg:border-t-0 lg:border-s lg:py-24">
          <div>
            <p className="mb-4 text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-[var(--iti-ink-soft)]">
              {t.markets[lang]}
            </p>
            <ul className="divide-y divide-[var(--iti-line)] border-y border-[var(--iti-line)]">
              {MARKETS.map((m) => {
                const active = focus === m.id
                const hot = hovered === m.id
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => (active ? backToMap() : focusMarket(m.id))}
                      onMouseEnter={() => !active && setHovered(m.id)}
                      onMouseLeave={() => setHovered(null)}
                      aria-pressed={active}
                      className={`group relative flex w-full items-center gap-4 overflow-hidden py-4 text-start transition ${
                        active || hot ? 'text-[var(--iti-navy)]' : 'text-[var(--iti-ink-soft)] hover:text-[var(--iti-navy)]'
                      }`}
                    >
                      <span
                        className={`h-8 w-[3px] shrink-0 rounded-full transition ${
                          active ? 'bg-[var(--iti-copper)]' : hot ? 'bg-[var(--iti-steel)]' : 'bg-transparent group-hover:bg-[var(--iti-line)]'
                        }`}
                        aria-hidden
                      />
                      <span
                        className={`h-10 w-14 shrink-0 overflow-hidden rounded-md transition duration-300 ${
                          active || hot ? 'opacity-100' : 'opacity-60 grayscale'
                        }`}
                        aria-hidden
                      >
                        <img src={m.photo} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[0.95rem] font-semibold text-[var(--iti-navy)]">{m.name[lang]}</span>
                        <span className="block text-xs">{marketCounts(m)}</span>
                      </span>
                      <span className="font-[family-name:var(--iti-head)] text-base font-bold tabular-nums text-[var(--iti-navy)]" dir="ltr">
                        <AnimatedNumber value={moneyValue(m.investment)} prefix="$" suffix="M" replay />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-[var(--iti-ink-soft)]">
              {t.sectors[lang]}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSector(null)}
                aria-pressed={sector === null}
                className={`iti-chip ${sector === null ? 'iti-chip-on' : ''}`}
              >
                {t.allSectors[lang]}
              </button>
              {SECTOR_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSector((cur) => (cur === s ? null : s))}
                  aria-pressed={sector === s}
                  className={`iti-chip ${sector === s ? 'iti-chip-on' : ''}`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-[1.5px] ring-[var(--iti-navy)]"
                    style={{ background: SECTORS[s].color }}
                    aria-hidden
                  />
                  {SECTORS[s].label[lang]}
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--iti-ink-soft)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-[var(--iti-navy)] bg-white" aria-hidden />
                {t.operational[lang]}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-dashed border-[var(--iti-navy)]" aria-hidden />
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

/** A shipment leaving Barcelona: the route draws itself while a copper dot travels it */
function RouteTrace({ d, k, reduceMotion }: { d: string; k: number; reduceMotion: boolean }) {
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
      <path ref={pathRef} d={d} fill="none" stroke="#a9613a" strokeWidth={2 * k} strokeLinecap="round" />
      <circle ref={dotRef} r={4.2 * k} fill="#a9613a" stroke="#ffffff" strokeWidth={1.6 * k} style={{ opacity: 0 }} />
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

/** Card pinned to the free right side of a focused frame (the map is never mirrored, so this is physical right) */
function SideCard({ rtl, children }: { rtl: boolean; children: React.ReactNode }) {
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-x-3 bottom-3 z-40 max-h-[72svh] overflow-y-auto rounded-2xl md:absolute md:inset-x-auto md:top-1/2 md:right-[2.5%] md:bottom-auto md:max-h-none md:w-[min(300px,34%)] md:-translate-y-1/2 md:overflow-visible"
      role="dialog"
    >
      <motion.div
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function CloseButton({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={label}
      className="absolute top-2.5 end-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--iti-navy)]/80 text-white backdrop-blur transition hover:bg-[var(--iti-navy)]"
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
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(5,53,82,0.45)] ring-1 ring-[var(--iti-line)]">
      <CloseButton onClose={onClose} label={t.close[lang]} />
      <a href={asset.url} target="_blank" rel="noopener noreferrer" className="group block">
        <div className="relative h-32 overflow-hidden">
          <img
            src={asset.photo}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <span
            className={`absolute bottom-2.5 start-2.5 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold tracking-wide ${
              asset.status === 'operational' ? 'bg-white text-[var(--iti-navy)]' : 'bg-[var(--iti-copper)] text-white'
            }`}
          >
            {asset.status === 'operational' ? t.operational[lang] : t.construction[lang]}
          </span>
          {asset.illustrative && <IllustrativeTag label={t.illustrative[lang]} />}
        </div>
        <div className="h-1" style={{ background: sector.color }} aria-hidden />
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <Logo asset={asset} />
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--iti-head)] text-[1.02rem] leading-tight font-bold text-[var(--iti-navy)]">
                {asset.name}
              </h3>
              <p className="mt-0.5 text-xs text-[var(--iti-ink-soft)]">{asset.city[lang]}</p>
            </div>
          </div>
          <p className="mt-3 text-[0.7rem] font-semibold tracking-[0.12em] uppercase" style={{ color: '#215c7e' }}>
            {asset.kind[lang]}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--iti-navy)]">
            {asset.milestone[lang]}
            {asset.investment ? ` · ${asset.investment}` : ''}
          </p>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-[var(--iti-ink-soft)]">{asset.about[lang]}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--iti-copper)]">
            {t.visit[lang]}
            <svg viewBox="0 0 16 16" className="h-3 w-3 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" aria-hidden>
              <path d="M5 11L11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </a>
      {total > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--iti-line)] px-4 py-2.5">
          <StepButton onClick={onPrev} label={t.prev[lang]} flip={lang === 'ar'} />
          <span dir="ltr" className="text-[0.7rem] font-semibold tabular-nums text-[var(--iti-ink-soft)]">
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

function Logo({ asset }: { asset: Asset }) {
  const sector = SECTORS[asset.sector]
  if (asset.logo) {
    return (
      <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-[var(--iti-line)] bg-white p-1.5">
        <img src={asset.logo} alt={`${asset.name} logo`} className="max-h-full max-w-full object-contain" />
      </span>
    )
  }
  return (
    <span
      className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg text-[0.7rem] font-extrabold tracking-[0.08em] text-white"
      style={{ background: `linear-gradient(135deg, ${sector.color}, #053552)` }}
      aria-hidden
    >
      {asset.monogram}
    </span>
  )
}

function OverviewCard({ market, lang, onClose }: { market: Market; lang: Lang; onClose: () => void }) {
  const t = COPY.footprint
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--iti-navy)] text-white shadow-[0_24px_60px_-20px_rgba(5,53,82,0.6)]">
      <CloseButton onClose={onClose} label={t.close[lang]} />
      <div className="relative h-28 overflow-hidden">
        <img src={market.photo} alt="" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--iti-navy)] to-transparent" />
        {market.illustrative && <IllustrativeTag label={t.illustrative[lang]} />}
      </div>
      <div className="p-5 pt-1">
        <p className="text-[0.68rem] font-semibold tracking-[0.18em] uppercase text-white/60">{market.name[lang]}</p>
        <p className="mt-1 font-[family-name:var(--iti-head)] text-lg font-bold">{market.headline[lang]}</p>
        <p className="mt-2 text-[0.8rem] leading-relaxed text-white/75">{market.summary[lang]}</p>
        {market.points && (
          <ul className="mt-3 space-y-1.5">
            {market.points.map((p) => (
              <li key={p.en} className="flex gap-2 text-[0.76rem] leading-snug text-white/85">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--iti-copper-soft)]" aria-hidden />
                {p[lang]}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-baseline justify-between border-t border-white/15 pt-3">
          <span className="text-xs text-white/60">{t.investment[lang]}</span>
          <span className="font-[family-name:var(--iti-head)] text-xl font-extrabold tabular-nums" dir="ltr">
            <MoneyCount value={market.investment} duration={900} />
          </span>
        </div>
      </div>
    </div>
  )
}
