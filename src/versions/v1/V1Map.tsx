import { useId, useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { countries, locations, getCompany } from '../../data'
import type { Location } from '../../data/types'
import {
  MAP_W,
  MAP_H,
  useGeoProjection,
  projectLatLng,
  worldCountries,
  worldLand,
  isFocusCountry,
  countryIdFromIso,
} from '../../maps/useGeoProjection'
import { getCountryFeature, COUNTRY_ISO } from '../../maps/worldData'
import { Reveal } from '../../components/Reveal'
import type { FeatureCollection } from 'geojson'

const ZONES = [
  { id: 'all', label: 'All Locations' },
  { id: 'egypt', label: 'Egypt' },
  { id: 'saudi-arabia', label: 'Saudi Arabia' },
  { id: 'uae', label: 'UAE' },
  { id: 'qatar', label: 'Qatar' },
  { id: 'jordan', label: 'Jordan' },
  { id: 'united-kingdom', label: 'United Kingdom' },
  { id: 'france', label: 'France' },
] as const

type ZoneId = (typeof ZONES)[number]['id']

/** MENA core — tighter crop so the map feels close (Europe still drawn at edges) */
const MENA_CORE = ['egypt', 'saudi-arabia', 'uae', 'qatar', 'jordan'] as const

function menaMarketsCollection(): FeatureCollection {
  const features = MENA_CORE.map((id) => getCountryFeature(id)).filter(
    Boolean,
  ) as FeatureCollection['features']
  return { type: 'FeatureCollection', features }
}

function primaryLocationForCountry(countryId: string): Location | null {
  const country = countries.find((c) => c.id === countryId)
  if (!country?.cities.length) return null
  return locations.find((l) => l.id === country.cities[0]) ?? null
}

function formatCoord(n: number, axis: 'lat' | 'lng') {
  const abs = Math.abs(n)
  const deg = Math.floor(abs)
  const minFloat = (abs - deg) * 60
  const min = Math.floor(minFloat)
  const sec = ((minFloat - min) * 60).toFixed(3)
  const hemi = axis === 'lat' ? (n >= 0 ? 'N' : 'S') : n >= 0 ? 'E' : 'W'
  return `${hemi} ${deg}° ${min}' ${sec}"`
}

function DiscoverBadgeHTML() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
      <div
        className="absolute inset-0 animate-[spin_22s_linear_infinite] rounded-full border border-[var(--map-border)]"
        aria-hidden
      />
      <svg className="absolute inset-0 h-full w-full animate-[spin_22s_linear_infinite]" viewBox="0 0 100 100">
        <defs>
          <path id="v1-disc-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
        </defs>
        <text fill="var(--map-label)" fontSize="7.5" letterSpacing="3" className="uppercase">
          <textPath href="#v1-disc-circle" startOffset="0%">
            DISCOVER STORIES · DISCOVER STORIES ·
          </textPath>
        </text>
      </svg>
      <div
        className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand)] bg-[var(--bg)] text-xl text-[var(--brand)]"
        aria-hidden
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--bg)]">
          +
        </span>
      </div>
    </div>
  )
}

export default function V1Map() {
  const uid = useId().replace(/:/g, '')
  const [zone, setZone] = useState<ZoneId>('all')
  /** Country under map hover — drives photo fill */
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null)

  useEffect(() => {
    if (!selectedLoc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLoc(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedLoc])

  // Photo follows: map hover > selected card's country > zone (if not all)
  const selectedCountryId = selectedLoc
    ? countries.find((c) => c.cities.includes(selectedLoc.id))?.id ?? null
    : null
  const activeCountryId =
    hoveredId ?? selectedCountryId ?? (zone === 'all' ? null : zone)

  // Stay on regional MENA frame so every market stays hoverable
  const fitTarget = useMemo(() => menaMarketsCollection(), [])
  const { projection, path } = useGeoProjection(fitTarget, 28)

  const activeFeature = activeCountryId ? getCountryFeature(activeCountryId) : null
  const activePathD = activeFeature ? path(activeFeature as never) : null

  const bounds = useMemo(() => {
    if (!activeFeature) return null
    const b = path.bounds(activeFeature as never)
    if (!b || Number.isNaN(b[0][0])) return null
    return b as [[number, number], [number, number]]
  }, [activeFeature, path])

  const centroid = useMemo(() => {
    if (!activeFeature) return null
    const c = path.centroid(activeFeature as never)
    if (!c || Number.isNaN(c[0])) return null
    return c as [number, number]
  }, [activeFeature, path])

  const countryMeta = countries.find((c) => c.id === activeCountryId)
  const countryImage = countryMeta?.image

  const nodes = useMemo(() => {
    return locations
      .map((loc) => {
        const p = projectLatLng(projection, loc.coordinates[0], loc.coordinates[1])
        if (!p) return null
        return { ...loc, x: p[0], y: p[1] }
      })
      .filter(Boolean) as Array<Location & { x: number; y: number }>
  }, [projection])

  const landD = path(worldLand as never) ?? ''

  const displayCoords =
    selectedLoc ??
    nodes.find((n) => n.countryCode === countryMeta?.code) ??
    nodes[0]

  /** Side list click → open info card for that market */
  function openZoneCard(id: ZoneId) {
    setZone(id)
    setHoveredId(null)
    if (id === 'all') {
      setSelectedLoc(null)
      return
    }
    setSelectedLoc(primaryLocationForCountry(id))
  }

  function openCountryFromMap(countryId: string) {
    setZone(countryId as ZoneId)
    setHoveredId(countryId)
    setSelectedLoc(primaryLocationForCountry(countryId))
  }

  const zoneIndex = Math.max(
    0,
    ZONES.findIndex((z) => z.id === zone || z.id === activeCountryId),
  )

  const badgePos = centroid
    ? {
        left: `${(centroid[0] / MAP_W) * 100}%`,
        top: `${(centroid[1] / MAP_H) * 100}%`,
      }
    : null

  const photoW = bounds ? Math.max(bounds[1][0] - bounds[0][0], 1) : 1
  const photoH = bounds ? Math.max(bounds[1][1] - bounds[0][1], 1) : 1

  return (
    <section
      id="presence"
      className="relative min-h-screen border-t border-[var(--border)] bg-[var(--map-bg)]"
    >
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* LEFT */}
        <aside className="flex flex-col justify-between border-b border-[var(--border)] px-6 py-14 md:px-10 lg:col-span-3 lg:border-b-0 lg:border-r lg:py-20">
          <Reveal>
            <p className="mb-5 text-[0.65rem] tracking-[0.4em] uppercase text-[var(--brand)]">
              Our Presence
            </p>
            <h2
              className="mb-6 text-[clamp(2rem,3.5vw,3.2rem)] leading-[1.08] font-medium"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Operating where
              <br />
              opportunity{' '}
              <span className="text-[var(--brand)]">grows.</span>
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">
              From Cairo headquarters to European studios — hover a market to
              reveal it, or choose a zone to open its story card.
            </p>
          </Reveal>
          <div className="mt-10 hidden lg:block">
            <p className="font-mono text-[0.65rem] leading-relaxed tracking-wider whitespace-pre-line text-[var(--text-muted)]">
              {displayCoords
                ? `${formatCoord(displayCoords.coordinates[0], 'lat')}\n${formatCoord(displayCoords.coordinates[1], 'lng')}`
                : '—'}
            </p>
          </div>
        </aside>

        {/* CENTER MAP */}
        <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-3 py-8 lg:col-span-6 lg:min-h-screen">
          <div
            className="relative w-full max-w-[920px] aspect-[900/620]"
            onMouseLeave={() => setHoveredId(null)}
          >
            <AnimatePresence>
              {activeCountryId && badgePos && (
                <motion.div
                  key={`badge-${activeCountryId}`}
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                  style={badgePos}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <DiscoverBadgeHTML />
                </motion.div>
              )}
            </AnimatePresence>

            <svg
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              className="relative z-0 h-full w-full overflow-visible"
              role="img"
              aria-label="Editorial map of Meridian markets"
            >
              <defs>
                {activePathD && bounds && countryImage && (
                  <pattern
                    id={`${uid}-photo-pat`}
                    patternUnits="userSpaceOnUse"
                    x={bounds[0][0]}
                    y={bounds[0][1]}
                    width={photoW}
                    height={photoH}
                  >
                    <image
                      href={countryImage}
                      x={0}
                      y={0}
                      width={photoW}
                      height={photoH}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </pattern>
                )}
                <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="2.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width={MAP_W} height={MAP_H} fill="var(--map-bg)" />

              <path d={landD} fill="var(--map-land)" opacity={0.35} />

              {/* Base country outlines + hover targets (drawn under photo) */}
              {worldCountries.features.map((f) => {
                const d = path(f as never)
                if (!d) return null
                const id = String(f.id)
                const ourId = countryIdFromIso(id)
                const focus = isFocusCountry(id)
                const isActive = ourId != null && ourId === activeCountryId

                return (
                  <path
                    key={id}
                    d={d}
                    fill={
                      isActive
                        ? 'transparent'
                        : focus
                          ? 'var(--map-land)'
                          : 'var(--map-land)'
                    }
                    fillOpacity={isActive ? 0 : focus ? 0.55 : 0.12}
                    stroke={isActive ? 'var(--brand)' : 'var(--map-border)'}
                    strokeWidth={isActive ? 2.2 : focus ? 1.15 : 0.35}
                    opacity={focus || isActive ? 1 : 0.4}
                    className={focus ? 'cursor-pointer' : undefined}
                    style={{ transition: 'stroke-width 0.25s, fill-opacity 0.25s' }}
                    onMouseEnter={() => {
                      if (ourId) setHoveredId(ourId)
                    }}
                    onClick={() => {
                      if (ourId) openCountryFromMap(ourId)
                    }}
                  />
                )
              })}

              {/* Wide hit pads so small Gulf states are easy to hover */}
              {Object.keys(COUNTRY_ISO).map((cid) => {
                const feat = getCountryFeature(cid)
                if (!feat) return null
                const d = path(feat as never)
                if (!d) return null
                return (
                  <path
                    key={`hit-${cid}`}
                    d={d}
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth={18}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredId(cid)}
                    onClick={() => openCountryFromMap(cid)}
                  />
                )
              })}

              {/* Photo fill on top of hit pads but pointer-events none so hover still works */}
              {activePathD && countryImage && bounds && (
                <path
                  d={activePathD}
                  fill={`url(#${uid}-photo-pat)`}
                  stroke="var(--brand)"
                  strokeWidth={2.6}
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {nodes.map((node) => {
                const nodeCountry = countries.find((c) =>
                  c.cities.includes(node.id),
                )
                const inFocus = nodeCountry != null
                const countryMatch =
                  !activeCountryId || nodeCountry?.id === activeCountryId
                const hot = selectedLoc?.id === node.id
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={countryMatch ? 1 : 0.2}
                    style={{ cursor: inFocus ? 'pointer' : 'default' }}
                    onMouseEnter={() => {
                      if (nodeCountry) setHoveredId(nodeCountry.id)
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!nodeCountry) return
                      setZone(nodeCountry.id as ZoneId)
                      setHoveredId(nodeCountry.id)
                      setSelectedLoc(node)
                    }}
                    role="button"
                    tabIndex={inFocus ? 0 : -1}
                    aria-label={node.city}
                  >
                    <circle
                      r={hot ? 7 : 5}
                      fill="var(--map-node)"
                      filter={`url(#${uid}-glow)`}
                    />
                    <circle r={1.8} fill="var(--map-bg)" />
                    {countryMatch && activeCountryId && (
                      <text
                        y={-10}
                        textAnchor="middle"
                        fill="var(--map-label)"
                        fontSize={10}
                        letterSpacing="0.12em"
                        style={{
                          textTransform: 'uppercase',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        {node.city}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>

          <p className="mt-4 text-center text-[0.6rem] tracking-[0.2em] uppercase text-[var(--text-muted)]">
            {activeCountryId
              ? `${countryMeta?.name ?? ''} — hover map · click list for card`
              : 'Hover a country on the map'}
          </p>

          <AnimatePresence>
            {selectedLoc && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="absolute bottom-6 left-4 right-4 z-30 overflow-hidden border border-[var(--border)] bg-[var(--surface)] md:left-auto md:right-8 md:w-[300px]"
                role="dialog"
              >
                <div className="relative h-36">
                  <img
                    src={selectedLoc.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-black/55 px-2 py-1 text-xs text-white"
                    onClick={() => setSelectedLoc(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[0.55rem] tracking-[0.25em] uppercase text-[var(--brand)]">
                    {selectedLoc.role}
                  </p>
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {selectedLoc.city}
                  </h3>
                  <p className="mb-3 text-xs text-[var(--text-muted)]">
                    {selectedLoc.country}
                  </p>
                  <p className="mb-4 text-xs leading-relaxed text-[var(--text-muted)]">
                    {selectedLoc.description}
                  </p>
                  <dl className="mb-4 grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3">
                    <div>
                      <dt className="text-[0.5rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        Companies
                      </dt>
                      <dd className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        {selectedLoc.companies.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.5rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        People
                      </dt>
                      <dd className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        {selectedLoc.employeeCount.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.5rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        Projects
                      </dt>
                      <dd className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                        {selectedLoc.projectCount}
                      </dd>
                    </div>
                  </dl>
                  <p className="mb-4 text-[0.65rem] text-[var(--text-muted)]">
                    {selectedLoc.companies
                      .map((id) => getCompany(id)?.shortName)
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <a
                    href="#projects"
                    className="inline-flex w-full items-center justify-center border border-[var(--brand)] bg-[var(--brand)] py-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--bg)] transition hover:bg-transparent hover:text-[var(--brand)]"
                  >
                    Explore Location
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT */}
        <aside className="relative flex flex-col border-t border-[var(--border)] px-6 py-12 md:px-8 lg:col-span-3 lg:border-t-0 lg:border-l lg:py-20">
          <p className="mb-8 text-[0.6rem] tracking-[0.3em] uppercase text-[var(--text-muted)]">
            Choose Zone
          </p>

          <div className="relative flex flex-1">
            <ul className="flex w-full flex-col">
              {ZONES.map((z) => {
                const active = zone === z.id || activeCountryId === z.id
                const count =
                  z.id === 'all'
                    ? locations.length
                    : locations.filter((l) =>
                        countries.find((c) => c.id === z.id)?.cities.includes(l.id),
                      ).length
                return (
                  <li key={z.id}>
                    <button
                      type="button"
                      onClick={() => openZoneCard(z.id)}
                      className={`flex w-full items-baseline justify-between py-3 text-left text-[0.75rem] tracking-[0.16em] uppercase transition ${
                        active
                          ? 'text-[var(--text)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <span
                        className={
                          active
                            ? 'underline decoration-[var(--brand)] decoration-1 underline-offset-8'
                            : undefined
                        }
                      >
                        {z.label}
                      </span>
                      <span className="tabular-nums opacity-40">{count}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="relative ml-3 hidden w-5 shrink-0 lg:block" aria-hidden>
              <div className="absolute inset-y-2 right-2 w-px bg-[var(--border)]" />
              {ZONES.map((_, i) => (
                <span
                  key={i}
                  className="absolute right-2 h-px"
                  style={{
                    top: `${(i / Math.max(ZONES.length - 1, 1)) * 100}%`,
                    width: i === zoneIndex ? 14 : 7,
                    background: i === zoneIndex ? 'var(--brand)' : 'var(--border)',
                  }}
                />
              ))}
            </div>
          </div>

          {countryMeta && (
            <div className="mt-8 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-muted)]">
              <p className="mb-1 text-[var(--text)]">{countryMeta.name}</p>
              <p>
                {countryMeta.companies} companies ·{' '}
                {countryMeta.employees.toLocaleString()} people
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}
