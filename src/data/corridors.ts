import { getLocation } from './locations'

export interface CorridorStory {
  id: string
  heading: string
  body: string
}

export interface Corridor {
  id: string
  label: string
  title: string
  subtitle: string
  /** Waypoints as location ids — route connects in order */
  stops: string[]
  /** Optional extra [lng, lat] for smoother arcs between stops */
  curveBoost?: number
  color: string
  stories: CorridorStory[]
  metrics: { label: string; value: string }[]
}

export const corridors: Corridor[] = [
  {
    id: 'mena-europe',
    label: 'Strategic Corridor',
    title: 'The Bridge, Not the Border',
    subtitle: 'Cairo → Dubai → London',
    stops: ['cairo', 'dubai', 'london'],
    color: '#e8a54b',
    stories: [
      {
        id: 'origin',
        heading: 'The Origin',
        body: 'Cairo anchors Meridian’s headquarters — where capital allocation, development strategy and regional delivery converge.',
      },
      {
        id: 'gateway',
        heading: 'The Gateway',
        body: 'Dubai is the commercial hinge: logistics, hospitality and technology companies operate across the Gulf from a single hub.',
      },
      {
        id: 'horizon',
        heading: 'The Horizon',
        body: 'London extends the group into European capital markets — Vertex Systems and Maison Hospitality steward the western edge of the network.',
      },
    ],
    metrics: [
      { label: 'Markets', value: '3' },
      { label: 'Companies', value: '8+' },
      { label: 'People', value: '2,000+' },
    ],
  },
  {
    id: 'gulf-spine',
    label: 'Gulf Spine',
    title: 'Where Capital Meets Craft',
    subtitle: 'Riyadh → Jeddah → Doha → Abu Dhabi',
    stops: ['riyadh', 'jeddah', 'doha', 'abu-dhabi'],
    color: '#e8a54b',
    stories: [
      {
        id: 'kingdom',
        heading: 'The Kingdom',
        body: 'Riyadh concentrates Atrium Developments, Forge Construction and Solara Energy against Vision-aligned urban programmes.',
      },
      {
        id: 'coast',
        heading: 'The Coast',
        body: 'Jeddah opens the Red Sea corridor — residential growth and Axis Logistics capacity along a historic trade edge.',
      },
      {
        id: 'gulf',
        heading: 'The Gulf',
        body: 'Doha and Abu Dhabi close the loop: precision construction, hospitality and clean-energy partnerships.',
      },
    ],
    metrics: [
      { label: 'Cities', value: '4' },
      { label: 'Projects', value: '40+' },
      { label: 'Focus', value: 'Energy & Build' },
    ],
  },
  {
    id: 'nile-mediterranean',
    label: 'Nile Axis',
    title: 'Home Market Density',
    subtitle: 'Alexandria → Cairo → New Capital',
    stops: ['alexandria', 'cairo', 'new-capital'],
    color: '#e8a54b',
    stories: [
      {
        id: 'port',
        heading: 'The Port',
        body: 'Alexandria remains Meridian’s industrial and freight gateway on the Mediterranean — Forge and Axis at full cadence.',
      },
      {
        id: 'core',
        heading: 'The Core',
        body: 'Cairo holds the densest concentration of group companies, talent and decision-making.',
      },
      {
        id: 'frontier',
        heading: 'The Frontier',
        body: 'The New Administrative Capital is where Atrium and Forge define the next chapter of Egyptian urban form.',
      },
    ],
    metrics: [
      { label: 'Employees', value: '1,850' },
      { label: 'Locations', value: '3' },
      { label: 'Role', value: 'HQ Market' },
    ],
  },
  {
    id: 'europe-atelier',
    label: 'Shadow Route',
    title: 'The Gateway, Not the Destination',
    subtitle: 'Paris → London',
    stops: ['paris', 'london'],
    curveBoost: 0.85,
    color: '#e8a54b',
    stories: [
      {
        id: 'atelier',
        heading: 'The Atelier',
        body: 'Paris hosts design-led technology partnerships and Maison culinary hospitality — craft as the group’s European language.',
      },
      {
        id: 'crossing',
        heading: 'The Crossing',
        body: 'The Channel corridor carries talent, capital and hospitality brands between two cities that define Meridian’s western edge.',
      },
      {
        id: 'capital',
        heading: 'The Capital',
        body: 'London is European headquarters: Vertex platforms and Maison brand stewardship for international travellers.',
      },
    ],
    metrics: [
      { label: 'Companies', value: '2' },
      { label: 'Focus', value: 'Tech & Stay' },
      { label: 'Cities', value: '2' },
    ],
  },
]

/** Sample a quadratic bezier for cinematic arcs between stops */
function sampleArc(
  a: [number, number],
  b: [number, number],
  boost = 1,
  steps = 24,
): [number, number][] {
  const [lng0, lat0] = a
  const [lng1, lat1] = b
  const mx = (lng0 + lng1) / 2
  const my = (lat0 + lat1) / 2
  // Perpendicular offset for a soft north/east bulge
  const dx = lng1 - lng0
  const dy = lat1 - lat0
  const len = Math.hypot(dx, dy) || 1
  const arc = Math.min(len * 0.28 * boost, 4.5 * boost)
  // Perpendicular bulge toward (+dy, -dx) — keeps Paris→London in the Channel, not the Atlantic
  const cx = mx + (dy / len) * arc
  const cy = my - (dx / len) * arc

  const pts: [number, number][] = []
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const u = 1 - t
    const x = u * u * lng0 + 2 * u * t * cx + t * t * lng1
    const y = u * u * lat0 + 2 * u * t * cy + t * t * lat1
    pts.push([x, y])
  }
  return pts
}

/** Build a smooth GeoJSON LineString with dense cinematic arcs */
export function corridorToGeoJSON(corridor: Corridor) {
  const coords: [number, number][] = []
  const stops = corridor.stops.map((id) => getLocation(id)).filter(Boolean)
  const boost = corridor.curveBoost ?? 1

  for (let i = 0; i < stops.length; i++) {
    const loc = stops[i]!
    const [lat, lng] = loc.coordinates
    const here: [number, number] = [lng, lat]
    if (i === 0) coords.push(here)
    if (i < stops.length - 1) {
      const next = stops[i + 1]!
      const there: [number, number] = [next.coordinates[1], next.coordinates[0]]
      coords.push(...sampleArc(here, there, boost), there)
    }
  }

  return {
    type: 'Feature' as const,
    properties: {
      id: corridor.id,
      label: corridor.label.toUpperCase(),
      corridorId: corridor.id,
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: coords,
    },
  }
}

export function corridorBounds(corridor: Corridor): [[number, number], [number, number]] {
  const feature = corridorToGeoJSON(corridor)
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const [lng, lat] of feature.geometry.coordinates) {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }
  // Tighter pad for short corridors (Channel), wider for long-haul
  const span = Math.max(maxLng - minLng, maxLat - minLat)
  const pad = span < 8 ? 1.2 : Math.min(span * 0.35, 5)
  return [
    [minLng - pad, minLat - pad],
    [maxLng + pad, maxLat + pad],
  ]
}

/** Bearing degrees from last two coordinates — for destination arrow */
export function corridorEndBearing(corridor: Corridor): number {
  const coords = corridorToGeoJSON(corridor).geometry.coordinates
  if (coords.length < 2) return 0
  const [lng0, lat0] = coords[coords.length - 2]!
  const [lng1, lat1] = coords[coords.length - 1]!
  const y = Math.sin(((lng1 - lng0) * Math.PI) / 180) * Math.cos((lat1 * Math.PI) / 180)
  const x =
    Math.cos((lat0 * Math.PI) / 180) * Math.sin((lat1 * Math.PI) / 180) -
    Math.sin((lat0 * Math.PI) / 180) *
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos(((lng1 - lng0) * Math.PI) / 180)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}
