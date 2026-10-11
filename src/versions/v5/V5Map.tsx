import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Map, { Marker, type MapRef } from 'react-map-gl/maplibre'
import type { Map as MaplibreMap, StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Search } from 'lucide-react'
import {
  corridors,
  corridorToGeoJSON,
  corridorBounds,
  type Corridor,
} from '../../data/corridors'
import { getLocation, getCompany, locations } from '../../data'
import type { Location } from '../../data/types'

/** Dark cinematic satellite — Esri imagery + place labels */
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  name: 'v5-cinematic-satellite',
  sources: {
    esri: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri',
      maxzoom: 19,
    },
    labels: {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-satellite',
      type: 'raster',
      source: 'esri',
      paint: {
        'raster-saturation': -0.4,
        'raster-brightness-min': 0.04,
        'raster-brightness-max': 0.68,
        'raster-contrast': 0.18,
      },
    },
    {
      id: 'place-labels',
      type: 'raster',
      source: 'labels',
      paint: {
        'raster-opacity': 0.5,
        'raster-brightness-min': 0.15,
        'raster-brightness-max': 0.85,
      },
    },
  ],
}

interface Props {
  activeId: string
  onSelectCorridor: (id: string) => void
}

function Hotspot({ size = 64 }: { size?: number }) {
  return (
    <div className="pointer-events-none relative" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 animate-ping rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(232,165,75,0.5) 0%, transparent 70%)',
        }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,220,160,0.95) 0%, rgba(232,165,75,0.7) 26%, rgba(232,165,75,0.18) 52%, transparent 72%)',
          boxShadow: '0 0 32px 10px rgba(232,165,75,0.55)',
        }}
      />
      <span
        className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff6e0]"
        style={{ boxShadow: '0 0 12px 3px rgba(255,246,224,0.95)' }}
      />
    </div>
  )
}

/** Project GeoJSON line to SVG path in screen space — cinematic glow that always renders */
function CorridorSvgOverlay({
  map,
  corridor,
  reveal,
}: {
  map: MaplibreMap | null
  corridor: Corridor
  reveal: number
}) {
  const [, setTick] = useState(0)
  const feature = useMemo(() => corridorToGeoJSON(corridor), [corridor])
  const uid = `v5-${corridor.id}`

  useEffect(() => {
    if (!map) return
    const bump = () => setTick((t) => t + 1)
    map.on('move', bump)
    map.on('zoom', bump)
    map.on('resize', bump)
    bump()
    return () => {
      map.off('move', bump)
      map.off('zoom', bump)
      map.off('resize', bump)
    }
  }, [map])

  if (!map) return null

  // Sibling of canvas-container — WebGL canvas would paint over SVG if nested inside it
  const container = map.getContainer()
  const pts = feature.geometry.coordinates
    .map(([lng, lat]) => {
      const p = map.project([lng, lat])
      return `${p.x},${p.y}`
    })
    .join(' ')

  if (!pts) return null

  const mid = feature.geometry.coordinates[Math.floor(feature.geometry.coordinates.length / 2)]!
  const midScreen = map.project(mid)
  const label = feature.properties.label

  const i = Math.floor(feature.geometry.coordinates.length / 2)
  const a = feature.geometry.coordinates[Math.max(0, i - 2)]!
  const b = feature.geometry.coordinates[Math.min(feature.geometry.coordinates.length - 1, i + 2)]!
  const pa = map.project(a)
  const pb = map.project(b)
  const angle = (Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180) / Math.PI

  const opacity = 0.4 + reveal * 0.6

  return createPortal(
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      style={{ zIndex: 2 }}
      aria-hidden
    >
      <defs>
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-soft`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="16" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <polyline
        points={pts}
        fill="none"
        stroke="#e8a54b"
        strokeWidth={28}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.18 * opacity}
        filter={`url(#${uid}-soft)`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#e8a54b"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.45 * opacity}
        filter={`url(#${uid}-glow)`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#e8a54b"
        strokeWidth={3.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10 9"
        opacity={opacity}
      />
      <polyline
        points={pts}
        fill="none"
        stroke="#ffe6b8"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.75 * opacity}
      />

      <text
        x={midScreen.x}
        y={midScreen.y - 10}
        fill="#e8a54b"
        fontSize={13}
        fontWeight={600}
        letterSpacing="0.42em"
        textAnchor="middle"
        opacity={opacity}
        transform={`rotate(${angle} ${midScreen.x} ${midScreen.y})`}
        style={{
          textTransform: 'uppercase',
          paintOrder: 'stroke',
          stroke: 'rgba(0,0,0,0.85)',
          strokeWidth: 3,
          fontFamily: 'DM Sans, system-ui, sans-serif',
        }}
      >
        {label}
      </text>
    </svg>,
    container,
  )
}

function bearingDeg(a: [number, number], b: [number, number]) {
  const [lng0, lat0] = a
  const [lng1, lat1] = b
  const y = Math.sin(((lng1 - lng0) * Math.PI) / 180) * Math.cos((lat1 * Math.PI) / 180)
  const x =
    Math.cos((lat0 * Math.PI) / 180) * Math.sin((lat1 * Math.PI) / 180) -
    Math.sin((lat0 * Math.PI) / 180) *
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos(((lng1 - lng0) * Math.PI) / 180)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

function sampleAlong(coords: [number, number][], t: number) {
  const segs = Math.max(coords.length - 1, 1)
  const f = Math.min(0.999, Math.max(0, t)) * segs
  const i = Math.min(segs - 1, Math.floor(f))
  const u = f - i
  const a = coords[i]!
  const b = coords[i + 1] ?? a
  return {
    lng: a[0] + (b[0] - a[0]) * u,
    lat: a[1] + (b[1] - a[1]) * u,
    bearing: bearingDeg(a, b),
  }
}

function useTravelingArrow(coords: [number, number][], replayKey: string) {
  const [pose, setPose] = useState<{ lng: number; lat: number; bearing: number } | null>(null)

  useEffect(() => {
    if (coords.length < 2) return
    const start = sampleAlong(coords, 0)
    setPose(start)
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 2200)
      setPose(sampleAlong(coords, p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [replayKey, coords])

  return pose
}

function PlaceCard({
  location,
  onClose,
}: {
  location: Location
  onClose: () => void
}) {
  const names = location.companies
    .map((id) => getCompany(id)?.shortName)
    .filter(Boolean)
    .join(' · ')

  return (
    <motion.aside
      key={location.id}
      role="dialog"
      aria-label={`${location.city} details`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35 }}
      className="v5-place-card pointer-events-auto absolute bottom-24 right-4 z-30 w-[min(320px,calc(100%-2rem))] overflow-hidden md:right-8"
    >
      <div className="relative h-32">
        <img src={location.image} alt="" className="h-full w-full object-cover" />
        <button
          type="button"
          className="absolute top-2 right-2 bg-black/55 px-2 py-1 text-[0.6rem] tracking-[0.16em] uppercase text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className="p-4">
        <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[var(--brand)]">
          {location.country}
        </p>
        <h3 className="text-2xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
          {location.city}
        </h3>
        <p className="mb-2 text-xs text-white/60">{location.role}</p>
        <p className="mb-3 text-xs leading-relaxed text-white/70">{location.description}</p>
        <dl className="mb-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
          <div>
            <dt className="text-[0.5rem] uppercase tracking-[0.16em] text-white/45">Companies</dt>
            <dd className="text-lg text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {location.companies.length}
            </dd>
          </div>
          <div>
            <dt className="text-[0.5rem] uppercase tracking-[0.16em] text-white/45">People</dt>
            <dd className="text-lg text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {location.employeeCount.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-[0.5rem] uppercase tracking-[0.16em] text-white/45">Projects</dt>
            <dd className="text-lg text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {location.projectCount}
            </dd>
          </div>
        </dl>
        {names && <p className="text-[0.65rem] text-white/55">{names}</p>}
      </div>
    </motion.aside>
  )
}

function fitCorridor(ml: MaplibreMap, corridor: Corridor, duration = 1600) {
  // Paris→London: bias camera east so the Channel sits in the clear map area (right of panel)
  if (corridor.id === 'europe-atelier') {
    ml.easeTo({
      center: [1.4, 50.15],
      zoom: 6.7,
      duration,
      essential: true,
    })
    return
  }
  const [[minLng, minLat], [maxLng, maxLat]] = corridorBounds(corridor)
  ml.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      padding: { top: 88, bottom: 100, left: 400, right: 72 },
      duration,
      essential: true,
      maxZoom: 6.4,
    },
  )
}

export function V5CinematicMap({ activeId, onSelectCorridor }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [mapInstance, setMapInstance] = useState<MaplibreMap | null>(null)
  const [lineReveal, setLineReveal] = useState(1)
  const [selected, setSelected] = useState<Location | null>(null)
  const active = corridors.find((c) => c.id === activeId) ?? corridors[0]

  const routeCoords = useMemo(
    () => corridorToGeoJSON(active).geometry.coordinates as [number, number][],
    [active],
  )
  const arrow = useTravelingArrow(routeCoords, active.id)

  useEffect(() => {
    if (!mapInstance) return
    setLineReveal(0)
    fitCorridor(mapInstance, active, 1700)
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1200)
      setLineReveal(p)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [activeId, mapInstance, active])

  const onLoad = useCallback(
    (e: { target: MaplibreMap }) => {
      const ml = e.target
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__v5map = ml
      setMapInstance(ml)
      setLineReveal(1)
      fitCorridor(ml, active, 0)
    },
    [active],
  )

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  function openPlace(id: string) {
    const loc = getLocation(id)
    if (!loc) return
    setSelected(loc)
    if (active.stops.includes(id)) return
    const host = corridors.find((c) => c.stops.includes(id))
    if (host) onSelectCorridor(host.id)
  }

  return (
    <div className="absolute inset-0">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 1.4,
          latitude: 50.15,
          zoom: 6.7,
        }}
        mapStyle={SATELLITE_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        onLoad={onLoad}
        fadeDuration={0}
      >
        {locations.map((loc) => {
          const onRoute = active.stops.includes(loc.id)
          const endpoint =
            loc.id === active.stops[0] || loc.id === active.stops[active.stops.length - 1]
          const picked = selected?.id === loc.id
          return (
            <Marker
              key={loc.id}
              longitude={loc.coordinates[1]}
              latitude={loc.coordinates[0]}
              anchor="center"
            >
              <button
                type="button"
                className="flex flex-col items-center"
                aria-label={loc.city}
                aria-pressed={picked}
                onClick={() => openPlace(loc.id)}
              >
                {onRoute ? (
                  <Hotspot size={endpoint ? 72 : 52} />
                ) : (
                  <span
                    className="block rounded-full"
                    style={{
                      width: picked ? 14 : 10,
                      height: picked ? 14 : 10,
                      background: '#e8a54b',
                      boxShadow: '0 0 16px rgba(232,165,75,0.85)',
                    }}
                  />
                )}
                <span
                  className={`-mt-0.5 whitespace-nowrap uppercase text-white ${
                    onRoute
                      ? 'text-[0.62rem] tracking-[0.28em]'
                      : 'text-[0.5rem] tracking-[0.18em] text-white/80'
                  }`}
                  style={{ textShadow: '0 2px 12px #000' }}
                >
                  {loc.city}
                </span>
              </button>
            </Marker>
          )
        })}

        {arrow && (
          <Marker longitude={arrow.lng} latitude={arrow.lat} anchor="center">
            <div
              className="pointer-events-none text-2xl leading-none"
              style={{
                color: '#e8a54b',
                transform: `rotate(${arrow.bearing - 90}deg)`,
                filter: 'drop-shadow(0 0 10px rgba(232,165,75,0.95))',
              }}
              aria-hidden
            >
              ▸
            </div>
          </Marker>
        )}
      </Map>

      <AnimatePresence>
        {selected && <PlaceCard location={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <CorridorSvgOverlay map={mapInstance} corridor={active} reveal={lineReveal} />

      {/* Left grade only — keeps amber corridor vivid on the map */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[min(420px,42vw)]"
        style={{
          background:
            'linear-gradient(90deg, rgba(6,10,16,0.55) 0%, rgba(6,10,16,0.2) 55%, transparent 100%)',
        }}
      />
    </div>
  )
}

const STORY_ICONS = [Maximize2, Search, Maximize2] as const

export function V5StoryPanel({
  corridor,
  corridorsList,
  onSelect,
}: {
  corridor: Corridor
  corridorsList: Corridor[]
  onSelect: (id: string) => void
}) {
  return (
    <aside className="pointer-events-auto relative z-20 w-full shrink-0 lg:w-[400px] lg:max-w-[44vw]">
      <div className="v5-glass-panel m-4 max-h-[calc(100vh-4.5rem)] overflow-y-auto md:m-6 lg:m-8">
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={corridor.id}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                className="mb-5 text-[clamp(1.75rem,3vw,2.45rem)] leading-[1.12] text-[var(--text)]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
              >
                {corridor.title}
              </h2>

              <div className="space-y-2.5">
                {corridor.stories.map((s, i) => {
                  const Icon = STORY_ICONS[i % STORY_ICONS.length]!
                  return (
                    <motion.article
                      key={s.id}
                      className="v5-story-card group relative"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.07, duration: 0.4 }}
                    >
                      <h3 className="mb-1.5 text-[0.78rem] font-semibold tracking-wide text-white">
                        {s.heading}
                      </h3>
                      <p className="text-[0.75rem] leading-relaxed text-white/65">{s.body}</p>

                      <span className="v5-story-orb pointer-events-none absolute -right-1 top-1/2 -translate-y-1/2 scale-75 opacity-0 transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                        <Icon size={18} strokeWidth={1.5} className="text-white/80" />
                      </span>
                    </motion.article>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 p-3 md:p-4">
          <p className="mb-2 px-1 text-[0.45rem] tracking-[0.3em] uppercase text-[var(--text-muted)]">
            Select corridor
          </p>
          <div className="flex flex-col gap-0.5">
            {corridorsList.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={`rounded-sm px-2.5 py-2 text-left text-[0.62rem] tracking-[0.12em] uppercase transition ${
                  c.id === corridor.id
                    ? 'bg-[rgba(232,165,75,0.12)] text-[var(--brand)]'
                    : 'text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text)]'
                }`}
              >
                {c.label}
                <span className="mt-0.5 block text-[0.5rem] normal-case tracking-normal opacity-50">
                  {c.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
