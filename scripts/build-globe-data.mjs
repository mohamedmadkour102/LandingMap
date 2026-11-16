/**
 * Pre-computes the data the ITI globe needs, so the page never ships a whole world atlas.
 *
 *   node scripts/build-globe-data.mjs
 *
 * Writes into src/versions/iti/geo/:
 *   dots.json         — flat [lng*10, lat*10, market, ...] for an equal-area dot matrix over land
 *                       (market: 0 = none, otherwise 1-based index into MARKET_ISO below).
 *                       Slow (a few minutes) — only rebuilt when missing or with --dots.
 *   regions.topo.json — simplified 1:50m country outlines around the markets the camera
 *                       zooms into (the readable, zoomed-in map + market hit areas).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { geoBounds, geoContains } from 'd3'
import { feature, quantize } from 'topojson-client'
import { topology } from 'topojson-server'
import { presimplify, simplify, quantile } from 'topojson-simplify'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, 'node_modules/world-atlas', p), 'utf8'))

const land50 = feature(read('land-50m.json'), read('land-50m.json').objects.land)
const c50 = read('countries-50m.json')
const countries50 = feature(c50, c50.objects.countries).features

/** Must match MARKETS order in src/versions/iti/content.ts */
const MARKET_ISO = [['818'], ['840'], ['616', '528', '380', '826'], ['682']]
/** Lat/lng boxes the zoomed camera can show (market frames + generous margin) */
const REGION_BOXES = [
  [10, 45, 15, 45], // Egypt / Red Sea / Levant      [latMin, latMax, lngMin, lngMax]
  [12, 58, -135, -55], // United States
  [30, 66, -20, 40], // Europe
  [8, 36, 28, 62], // Saudi Arabia / Gulf
]

/* ---------- dot matrix ---------- */
const OUT_DIR = path.join(ROOT, 'src/versions/iti/geo')
fs.mkdirSync(OUT_DIR, { recursive: true })
const dotsFile = path.join(OUT_DIR, 'dots.json')
const STEP = 1.2

if (!fs.existsSync(dotsFile) || process.argv.includes('--dots')) {
  const marketFeatures = MARKET_ISO.map((isos) => countries50.filter((f) => isos.includes(String(f.id))))
  const dots = []
  for (let lat = -56; lat <= 80; lat += STEP) {
    const ring = Math.max(1, Math.round((360 / STEP) * Math.cos((lat * Math.PI) / 180)))
    const offset = (Math.round(lat / STEP) % 2) * 0.5 // stagger rows so the matrix reads as a weave
    for (let i = 0; i < ring; i++) {
      const lng = -180 + ((i + offset) * 360) / ring
      const pt = [lng, lat]
      if (!geoContains(land50, pt)) continue
      let m = 0
      for (let k = 0; k < marketFeatures.length && !m; k++) if (marketFeatures[k].some((f) => geoContains(f, pt))) m = k + 1
      dots.push(Math.round(lng * 10), Math.round(lat * 10), m)
    }
  }
  fs.writeFileSync(dotsFile, JSON.stringify({ step: STEP, dots }))
  console.log(`dots: ${dots.length / 3}`)
}

/* ---------- outlines ---------- */
const intersects = (f) => {
  const [[w, s], [e, n]] = geoBounds(f)
  return REGION_BOXES.some(([la0, la1, lo0, lo1]) => {
    const lngHit = w <= e ? w <= lo1 && e >= lo0 : true // antimeridian-crossing shapes (Russia, USA) always hit
    return lngHit && s <= la1 && n >= la0
  })
}
/** Keep only the polygons of a country that fall inside a region box (Canada's Arctic islands never show) */
const trim = (f) => {
  if (f.geometry.type !== 'MultiPolygon') return f
  const polys = f.geometry.coordinates.filter((poly) => intersects({ type: 'Polygon', coordinates: poly }))
  return polys.length ? { ...f, geometry: { type: 'MultiPolygon', coordinates: polys } } : null
}
const regions = countries50
  .filter((f) => f.geometry && intersects(f))
  .map((f) => trim({ type: 'Feature', ...(f.id != null ? { id: String(f.id) } : {}), properties: {}, geometry: f.geometry }))
  .filter(Boolean)

let topo = topology({ countries: { type: 'FeatureCollection', features: regions } })
topo = presimplify(topo)
topo = simplify(topo, quantile(topo, 0.7))
topo = quantize(topo, 3e4) // delta-encoded integer arcs
const regionsFile = path.join(OUT_DIR, 'regions.topo.json')
fs.writeFileSync(regionsFile, JSON.stringify(topo))
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0)
console.log(`regions: ${regions.length} countries · ${kb(regionsFile)} KB · dots ${kb(dotsFile)} KB`)
